if [ "$CF_PAGES_BRANCH" == "production" ]; then
  # Return the app version when building in production
  echo $(node -p 'require("./package.json").version')
else
  # Return an incremented patch app version when building in non-production
  echo $(node -p 'require("./package.json").version' | awk -F. -v OFS=. '{$NF++;print}')
fi
