// ==================== Cloudinary 日期提取腳本（GitHub Actions 版本）====================
// 用途：自動從 Cloudinary 獲取所有漫畫圖片的日期，生成 dates.json
// 特點：只使用環境變數，不包含硬編碼的 API Secret
// ⚠️ 注意：此檔案可以安全地上傳到 GitHub

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// ==================== Cloudinary 配置 ====================
// 從環境變數讀取（由 GitHub Secrets 提供）
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==================== 配置選項 ====================
const CONFIG = {
  // 圖片檔案的前綴（如果你的圖片都在特定資料夾）
  prefix: '',
  
  // 圖片類型（預設為 upload）
  resourceType: 'image',
  
  // 每次請求的最大結果數（Cloudinary 上限為 500）
  maxResults: 500,
  
  // 日期格式的正則表達式（YYYY-MM-DD）
  dateRegex: /^\d{4}-\d{2}-\d{2}$/,
  
  // 輸出 JSON 檔案路徑
  outputFile: 'dates.json'
};

// ==================== 主函數 ====================
async function fetchAllDates() {
  console.log('🔍 開始從 Cloudinary 提取漫畫日期...\n');
  
  // 檢查環境變數
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ 錯誤：缺少必要的環境變數');
    console.error('請確認已設定以下環境變數：');
    console.error('  - CLOUDINARY_CLOUD_NAME');
    console.error('  - CLOUDINARY_API_KEY');
    console.error('  - CLOUDINARY_API_SECRET');
    process.exit(1);
  }
  
  let allDates = [];
  let nextCursor = null;
  let pageCount = 0;

  try {
    do {
      pageCount++;
      console.log(`📄 正在處理第 ${pageCount} 頁...`);
      
      // 請求 Cloudinary API
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: CONFIG.resourceType,
        prefix: CONFIG.prefix,
        max_results: CONFIG.maxResults,
        next_cursor: nextCursor
      });

      // 提取符合日期格式的檔名
      const dates = result.resources
        .map(resource => {
          // 移除副檔名和路徑，只保留檔名
          const publicId = resource.public_id;
          const filename = publicId.split('/').pop(); // 取最後一段
          return filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
        })
        .filter(filename => CONFIG.dateRegex.test(filename));

      allDates = allDates.concat(dates);
      console.log(`   ✓ 找到 ${dates.length} 個有效日期`);

      // 檢查是否還有下一頁
      nextCursor = result.next_cursor;

    } while (nextCursor);

    // 排序並去重
    allDates = [...new Set(allDates)].sort();

    console.log(`\n📊 統計資訊：`);
    console.log(`   總共找到 ${allDates.length} 個漫畫日期`);
    if (allDates.length > 0) {
      console.log(`   日期範圍: ${allDates[0]} 至 ${allDates[allDates.length - 1]}`);
    }

    // 生成 JSON 檔案（包含所有日期，不過濾未來日期）
    const jsonData = {
      lastUpdated: new Date().toISOString(),
      totalComics: allDates.length,
      firstDate: allDates.length > 0 ? allDates[0] : null,
      lastDate: allDates.length > 0 ? allDates[allDates.length - 1] : null,
      availableDates: allDates
    };

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(jsonData, null, 2));
    console.log(`\n💾 已生成 ${CONFIG.outputFile}`);

    // 顯示前 10 個和後 10 個日期作為預覽
    if (allDates.length > 0) {
      console.log('\n📊 日期預覽：');
      console.log('最早 10 個:', allDates.slice(0, Math.min(10, allDates.length)).join(', '));
      console.log('最新 10 個:', allDates.slice(-Math.min(10, allDates.length)).join(', '));

      // 顯示統計資訊
      console.log('\n📈 年度統計：');
      const years = {};
      allDates.forEach(date => {
        const year = date.split('-')[0];
        years[year] = (years[year] || 0) + 1;
      });
      Object.keys(years).sort().forEach(year => {
        console.log(`   ${year}: ${years[year]} 篇`);
      });
    }

    console.log('\n✨ 完成！');
    console.log('💡 提示：dates.json 已包含所有日期，網頁會自動過濾未來日期');

  } catch (error) {
    console.error('\n❌ 錯誤:', error.message);
    
    if (error.error && error.error.message) {
      console.error('詳細訊息:', error.error.message);
    }
    
    // 常見錯誤提示
    if (error.message.includes('Must supply api_key')) {
      console.error('\n💡 提示: 請確認環境變數已正確設定');
      console.error('   GitHub Actions: 確認 Secrets 已設定');
      console.error('   本地執行: 設定環境變數或修改 cloudinary.config()');
    }
    
    process.exit(1);
  }
}

// ==================== 執行腳本 ====================
fetchAllDates();
