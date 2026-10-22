import { execSync } from 'child_process';
import fs from 'fs';

function run(command, options = {}) {
  return execSync(command, { stdio: 'inherit', ...options });
}

function runCapture(command) {
  return execSync(command, { encoding: 'utf-8' }).trim();
}

function getGitExecutable() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return 'git';
  } catch {
    const defaultWinGit = 'C:\\Program Files\\Git\\cmd\\git.exe';
    if (fs.existsSync(defaultWinGit)) {
      return `"${defaultWinGit}"`;
    }
    console.error('❌ Error: Git tidak ditemukan di PATH maupun di "C:\\Program Files\\Git\\cmd\\git.exe".');
    process.exit(1);
  }
}

async function main() {
  const git = getGitExecutable();

  console.log('\n🚀 Memulai proses deploy ke GitHub...\n');

  try {
    // 1. Ambil nama branch aktif
    const currentBranch = runCapture(`${git} rev-parse --abbrev-ref HEAD`) || 'main';
    console.log(`📌 Branch aktif: \x1b[36m${currentBranch}\x1b[0m`);

    // 2. Cek apakah ada perubahan file yang belum di-commit
    const statusOutput = runCapture(`${git} status --porcelain`);
    const hasChanges = statusOutput.length > 0;

    if (hasChanges) {
      console.log('📦 Menambahkan semua perubahan file...');
      run(`${git} add .`);

      // Tentukan pesan commit (bisa kustom atau otomatis timestamp)
      const userMessage = process.argv.slice(2).join(' ').trim();
      const timestamp = new Date().toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'medium',
      });
      const commitMessage = userMessage || `deploy: update ${timestamp}`;

      console.log(`📝 Membuat commit: "\x1b[32m${commitMessage}\x1b[0m"...`);
      run(`${git} commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
    } else {
      console.log('ℹ️  Tidak ada file baru yang diubah.');
    }

    // 3. Push ke remote GitHub
    console.log(`\n⬆️  Mengirim commit ke GitHub (\x1b[35morigin/${currentBranch}\x1b[0m)...`);
    run(`${git} push origin ${currentBranch}`);

    console.log('\n✅ \x1b[32mBerhasil deploy ke GitHub!\x1b[0m');
    console.log(`🔗 Cek repositori: https://github.com/yuliastutifajar/Nutri-Bayi-CMS\n`);
  } catch (error) {
    console.error('\n❌ Terjadi kesalahan saat deploy ke GitHub:');
    if (error.message) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

main();
