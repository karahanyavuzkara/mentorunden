import { Router } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

// Test database connection
router.get('/db', async (req, res) => {
  try {
    // Test query: Get count of profiles
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    res.json({
      success: true,
      message: 'Database connection successful!',
      tables: {
        profiles: {
          accessible: true,
          count: count || 0
        }
      },
      config: {
        url: process.env.SUPABASE_URL ? 'configured' : 'missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      details: error
    });
  }
});

// Test querying all tables
router.get('/tables', async (req, res) => {
  try {
    const tables = ['profiles', 'mentors', 'bookings'];
    const results: Record<string, any> = {};

    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      results[table] = {
        accessible: !error,
        count: count || 0,
        error: error?.message || null
      };
    }

    res.json({
      success: true,
      message: 'Table accessibility test',
      tables: results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

export default router;

