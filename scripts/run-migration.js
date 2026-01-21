/**
 * Supabase 마이그레이션 실행 스크립트
 * 실행: node scripts/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runSQL(sql, description) {
  console.log(`\n📌 ${description}...`);

  try {
    // Supabase JS 클라이언트는 직접 SQL 실행을 지원하지 않으므로
    // RPC 함수를 통해 실행하거나, 테이블 API를 사용해야 합니다.
    // 여기서는 fetch를 사용해서 PostgreSQL REST API를 직접 호출합니다.

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    console.log(`✅ ${description} 완료!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} 실패:`, error.message);
    return false;
  }
}

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  return !error;
}

async function main() {
  console.log('🚀 Golfearn 클럽 카탈로그 마이그레이션 시작\n');
  console.log('Supabase URL:', supabaseUrl);

  // 테이블 존재 여부 확인
  console.log('\n📋 테이블 상태 확인...');

  const brandsExist = await checkTableExists('golf_club_brands');
  const clubsExist = await checkTableExists('golf_clubs');

  console.log(`  - golf_club_brands: ${brandsExist ? '✅ 존재' : '❌ 없음'}`);
  console.log(`  - golf_clubs: ${clubsExist ? '✅ 존재' : '❌ 없음'}`);

  if (brandsExist && clubsExist) {
    // 데이터 개수 확인
    const { count: brandCount } = await supabase
      .from('golf_club_brands')
      .select('*', { count: 'exact', head: true });

    const { count: clubCount } = await supabase
      .from('golf_clubs')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 현재 데이터:`);
    console.log(`  - 브랜드: ${brandCount || 0}개`);
    console.log(`  - 클럽: ${clubCount || 0}개`);

    if ((clubCount || 0) >= 50) {
      console.log('\n✅ 이미 마이그레이션이 완료된 상태입니다!');
      return;
    }
  }

  console.log('\n⚠️  Supabase JS 클라이언트는 직접 SQL 실행을 지원하지 않습니다.');
  console.log('📌 아래 방법 중 하나를 선택하세요:\n');

  console.log('='.repeat(60));
  console.log('방법 1: Supabase Dashboard에서 SQL 실행');
  console.log('='.repeat(60));
  console.log(`\n1. https://supabase.com/dashboard/project/bfcmjumgfrblvyjuvmbk/sql 접속`);
  console.log('2. 첫 번째 SQL 실행: supabase/migrations/20260119_add_club_catalog.sql');
  console.log('3. 두 번째 SQL 실행: supabase/migrations/20260119_seed_clubs.sql');

  console.log('\n' + '='.repeat(60));
  console.log('방법 2: 터미널에서 Supabase CLI 사용');
  console.log('='.repeat(60));
  console.log(`\nnpx supabase login`);
  console.log('npx supabase link --project-ref bfcmjumgfrblvyjuvmbk');
  console.log('npx supabase db push');

  console.log('\n');
}

main().catch(console.error);
