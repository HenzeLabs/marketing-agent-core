#!/bin/sh
cd $(dirname $0)
npm run build && netlify deploy --prod --dir dist