// fixWhatsApp.js
const fs = require("fs");
const path = require("path");

const oldNumber = "+2347035476242";
const newNumber = "+2347035476242";

// Escape regex special characters in oldNumber
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Scan all files in project recursively
function replaceInFiles(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      replaceInFiles(fullPath);
    } else {
      if (/\.(js|ts|html|ejs|jsx|tsx|json|md|txt|css)$/i.test(entry.name)) {
        let content = fs.readFileSync(fullPath, "utf8");
        if (content.includes(oldNumber)) {
          const regex = new RegExp(escapeRegex(oldNumber), "g");
          const updated = content.replace(regex, newNumber);
          fs.writeFileSync(fullPath, updated, "utf8");
          console.log(`✅ Fixed: ${fullPath}`);
        }
      }
    }
  });
}

replaceInFiles(process.cwd());
console.log("🎯 WhatsApp number replacement completed.");

