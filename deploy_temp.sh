#!/bin/bash
npm run build
gh-pages -d dist
git add .
git commit -m "auto update 2026-03-10_00:29"
git push
