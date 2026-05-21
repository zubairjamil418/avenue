const fs = require('fs');
const file = '/var/www/vhosts/avenueretail.co.uk/httpdocs/sellzy-ecommerce/apps/web/src/app/[locale]/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const activeIcons = iconsRes.data?.data || iconsRes.data || [];\n  console.log("SERVER LOG activeIcons:", activeIcons);\n  console.log("Header Logo:", headerLogo);\n',
  'const activeIcons = iconsRes.data?.data || iconsRes.data || [];'
);

content = content.replace(
  'const footerLogo = activeIcons.find((icon: any) => icon.category === "footer" || icon.key === "footer_logo" || (icon.category === "logo" && icon.name === "footer_logo"))?.imageUrl;',
  'const footerLogo = activeIcons.find((icon: any) => icon.category === "footer" || icon.key === "footer_logo" || (icon.category === "logo" && icon.name === "footer_logo"))?.imageUrl;\n  console.log("SERVER LOG activeIcons length:", activeIcons.length, "header:", headerLogo, "footer:", footerLogo);\n'
);

fs.writeFileSync(file, content);
