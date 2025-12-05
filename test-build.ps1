echo "Testing TypeScript compilation..."
npx tsc --noEmit -p tsconfig.app.json

echo "`nIf no errors above, trying Angular build..."
ng build --configuration development
