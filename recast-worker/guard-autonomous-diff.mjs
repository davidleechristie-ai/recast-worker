import { execSync } from 'node:child_process';

const changed = execSync('git ls-files --modified --deleted --others --exclude-standard', { encoding: 'utf8' })
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

if (changed.length === 0) {
  console.log('No autonomous changes detected.');
  process.exit(0);
}

const maxChangedFiles = 8; // normally <= 6 product files plus growth log and scoreboard
if (changed.length > maxChangedFiles) {
  console.error(`Autonomous change rejected: ${changed.length} files changed (max ${maxChangedFiles}).`);
  console.error(changed.join('\n'));
  process.exit(1);
}

const allowedExact = new Set([
  'recast-worker/AUTONOMOUS_GROWTH_LOG.md',
  'recast-worker/GROWTH_SCOREBOARD.json',
]);

const blockedPublicPatterns = [
  /^recast-worker\/public\/app\.js$/,
  /^recast-worker\/public\/app\//,
  /^recast-worker\/public\/api\//,
];

const invalid = changed.filter((path) => {
  if (allowedExact.has(path)) return false;
  if (!path.startsWith('recast-worker/public/')) return true;
  return blockedPublicPatterns.some((pattern) => pattern.test(path));
});

if (invalid.length) {
  console.error('Autonomous change rejected: protected paths were modified:');
  console.error(invalid.join('\n'));
  process.exit(1);
}

console.log('Autonomous diff guard passed for:');
console.log(changed.join('\n'));
