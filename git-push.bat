@echo off
git add .
git commit -m "Initial release: Microfinance Admin Panel"
git branch -M main
git remote add origin https://github.com/neelabja321/MFPanel.git
git remote set-url origin https://github.com/neelabja321/MFPanel.git
git push -u origin main
