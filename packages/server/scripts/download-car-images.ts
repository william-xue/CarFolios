/**
 * 下载汽车图片到本地 uploads 目录
 * 运行: npx ts-node scripts/download-car-images.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

// Unsplash 汽车图片 ID 列表（高清真实汽车图片）
const CAR_IMAGE_IDS = [
  // 豪华轿车
  '494976388531-d1058494cdd8', // BMW
  '503376780353-7e6692767b70', // Porsche
  '542362567-b07e54358753',   // Mercedes
  '555215695-3004980ad54e',   // BMW M4
  '552519507-da3b142c6e3d',   // Porsche 911
  '583121274602-3e2820c69888', // Red sports car
  '544636331-e26879cd4d9b',   // Audi
  '580273916550-e323be2ae537', // BMW front
  '617531653332-bd46c24f2068', // Tesla
  '605559424-14d1d6b6f587',   // Mercedes AMG
  
  // SUV
  '519244703-e644027d2fe1',   // Range Rover
  '533473359-e27f97e3c4a0',   // SUV
  '549317661-bd3d4eb5f4e6',   // Jeep
  '606567595-d45a7e25c7e0',   // BMW X5
  '558618666-fcd25c85f64e',   // Audi Q7
  
  // 跑车
  '525609004-a2a0517cc2ea',   // Lamborghini
  '514790193-24fa9e366677',   // Ferrari
  '592838064-b2528a07017a',   // McLaren
  '568605114-2e3c00273983',   // Porsche GT
  '507136566-58306bb6edf1',   // Sports car
  
  // 经典车型
  '489824904-14bd529c984d',   // Classic car
  '492144534-a09f5529c82e',   // Vintage
  '515876879-3f161f4be6dc',   // Retro
  '526726538-6907a6a601fa',   // Muscle car
  '544620347-c4cf9b78c4a7',   // American classic
  
  // 更多现代车
  '542282088-d0c8d6c8e8a4',   // Modern sedan
  '558981806-d6e6f1a4c4e6',   // Luxury
  '571104508-a9e0e8d0e8a4',   // Executive
  '581889470-d0c8d6c8e8a4',   // Premium
  '591234567-a0b0c0d0e0f0',   // Sedan
  
  // 电动车
  '620706857-74ea0bc56e5f',   // Tesla Model S
  '619037914-ecbdef53d0d0',   // Electric car
  '625246324-d0c8d6c8e8a4',   // EV
  
  // 内饰
  '549399542-a6a950f7c498',   // Interior
  '558981359-fee9a39e60a4',   // Dashboard
  '503736695-5e0e0e0e0e0e',   // Steering wheel
]

// 备用图片源（如果 Unsplash 失败）
const BACKUP_URLS = [
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
  'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg',
  'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg',
  'https://images.pexels.com/photos/119435/pexels-photo-119435.jpeg',
  'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
  'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg',
  'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg',
  'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
  'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg',
  'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg',
  'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg',
  'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg',
  'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg',
  'https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg',
  'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg',
  'https://images.pexels.com/photos/1805053/pexels-photo-1805053.jpeg',
  'https://images.pexels.com/photos/1880894/pexels-photo-1880894.jpeg',
  'https://images.pexels.com/photos/1974596/pexels-photo-1974596.jpeg',
  'https://images.pexels.com/photos/2036544/pexels-photo-2036544.jpeg',
  'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg',
  'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg',
  'https://images.pexels.com/photos/2526128/pexels-photo-2526128.jpeg',
  'https://images.pexels.com/photos/2676096/pexels-photo-2676096.jpeg',
  'https://images.pexels.com/photos/2684219/pexels-photo-2684219.jpeg',
  'https://images.pexels.com/photos/2920064/pexels-photo-2920064.jpeg',
  'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg',
  'https://images.pexels.com/photos/3354648/pexels-photo-3354648.jpeg',
  'https://images.pexels.com/photos/3422964/pexels-photo-3422964.jpeg',
  'https://images.pexels.com/photos/3593922/pexels-photo-3593922.jpeg',
  'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg',
  'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg',
  'https://images.pexels.com/photos/3786091/pexels-photo-3786091.jpeg',
  'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg',
  'https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg',
  'https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg',
  'https://images.pexels.com/photos/4065891/pexels-photo-4065891.jpeg',
  'https://images.pexels.com/photos/4116205/pexels-photo-4116205.jpeg',
  'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg',
  'https://images.pexels.com/photos/4194477/pexels-photo-4194477.jpeg',
  'https://images.pexels.com/photos/4280505/pexels-photo-4280505.jpeg',
  'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg',
  'https://images.pexels.com/photos/4480505/pexels-photo-4480505.jpeg',
  'https://images.pexels.com/photos/4606346/pexels-photo-4606346.jpeg',
  'https://images.pexels.com/photos/4674337/pexels-photo-4674337.jpeg',
  'https://images.pexels.com/photos/4753987/pexels-photo-4753987.jpeg',
  'https://images.pexels.com/photos/4827038/pexels-photo-4827038.jpeg',
  'https://images.pexels.com/photos/4997431/pexels-photo-4997431.jpeg',
  'https://images.pexels.com/photos/5086489/pexels-photo-5086489.jpeg',
  'https://images.pexels.com/photos/5214413/pexels-photo-5214413.jpeg',
  'https://images.pexels.com/photos/5372762/pexels-photo-5372762.jpeg',
]

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'cars')

// 确保目录存在
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 创建目录: ${dir}`)
  }
}

// 下载单个图片
function downloadImage(url: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const filepath = path.join(UPLOAD_DIR, filename)
    
    // 如果文件已存在，跳过
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  跳过已存在: ${filename}`)
      resolve(filepath)
      return
    }

    const file = fs.createWriteStream(filepath)
    
    https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          file.close()
          fs.unlinkSync(filepath)
          downloadImage(redirectUrl, filename).then(resolve).catch(reject)
          return
        }
      }

      if (response.statusCode !== 200) {
        file.close()
        fs.unlinkSync(filepath)
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }

      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`✅ 下载成功: ${filename}`)
        resolve(filepath)
      })
    }).on('error', (err) => {
      file.close()
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      reject(err)
    })
  })
}

// 主函数
async function main() {
  console.log('🚗 开始下载汽车图片...\n')
  
  ensureDir(UPLOAD_DIR)
  
  const downloaded: string[] = []
  const failed: string[] = []
  
  // 使用 Pexels 图片（更稳定）
  for (let i = 0; i < BACKUP_URLS.length; i++) {
    const url = `${BACKUP_URLS[i]}?auto=compress&cs=tinysrgb&w=800`
    const filename = `car-${String(i + 1).padStart(3, '0')}.jpg`
    
    try {
      await downloadImage(url, filename)
      downloaded.push(filename)
      // 添加延迟避免被限流
      await new Promise(r => setTimeout(r, 500))
    } catch (err) {
      console.log(`❌ 下载失败: ${filename} - ${err}`)
      failed.push(filename)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`📊 下载完成!`)
  console.log(`   ✅ 成功: ${downloaded.length} 张`)
  console.log(`   ❌ 失败: ${failed.length} 张`)
  console.log(`   📁 保存位置: ${UPLOAD_DIR}`)
  
  // 生成图片列表供 seed 使用
  const imageList = downloaded.map(f => `/uploads/cars/${f}`)
  console.log('\n📝 图片路径列表 (复制到 seed.ts):')
  console.log(JSON.stringify(imageList, null, 2))
}

main().catch(console.error)
