const fs = require('fs');
const path = require('path');

const replacements = {
    '[SOCKET]': '[SOCKET]',
    '[USER]': '[USER]',
    '[BYE]': '[BYE]',
    '[OFFLINE]': '[OFFLINE]',
    '[ANNOUNCE]': '[ANNOUNCE]',
    '[EMAIL]': '[EMAIL]',
    '[FIREBASE]': '[FIREBASE]',
    '[LINK]': '[LINK]',
    '[TICKET]': '[TICKET]',
    '[PDF]': '[PDF]',
    '[TIP]': '[TIP]',
    '[PARTY]': '[PARTY]',
    '[SEARCH]': '[SEARCH]',
    '[STATS]': '[STATS]',
    '[SIGNAL]': '[SIGNAL]',
    '[QUEUE]': '[QUEUE]',
    '[DEBUG]': '[DEBUG]',
    '[PATH]': '[PATH]',
    '[KEY]': '[KEY]',
    '[TEST]': '[TEST]',
    '[ID]': '[ID]',
    '[NOTIF]': '[NOTIF]'
};

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
};

const files = walk(path.join(__dirname, '../../'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    Object.keys(replacements).forEach(key => {
        if (content.includes(key)) {
            const re = new RegExp(key, 'g');
            content = content.replace(re, replacements[key]);
            modified = true;
        }
    });
    
    if (modified) {
        console.log(`Cleaning: ${file}`);
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log('Global cleanup complete.');
