/*
  Copyright 2020 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = function requiredPlugins(locales = [], widgets=[], excludeThemes=[]) {
  if (process.env["TEST_ENV"]) {
    return [];
  }
  let jsapiPkg = null;
  let jsapiCorePkg = null;
  let jsapi = null;

  // Check if @arcgis/core is installed
  try {
    jsapiCorePkg = require("@arcgis/core/package.json");
  } catch (err) {
    jsapiCorePkg = null;
  }

  // Check if arcgis-js-api is installed
  try {
    jsapiPkg = require("arcgis-js-api/package.json");
  } catch (err) {
    jsapiPkg = null;
  }

  if (jsapiCorePkg) {
    console.log(`Using @arcgis/core version: ${jsapiCorePkg.version}`);
    jsapi = "@arcgis/core";
  } else if (jsapiPkg) {
    console.log(`Using arcgis-js-api version: ${jsapiPkg.version}`);
    jsapi = "arcgis-js-api";
  } else {
    throw new Error(
        "The `@arcgis/webpack-plugin` should only be used with `@arcgis/core` or `arcgis-js-api`. Please install one of them."
    );
  }


  const localesIgnoreList = locales.map((locale) => `*_${locale}`).join("|");
  const localesIgnoreGlob = `**/!(${localesIgnoreList}).json`;
  console.log("localesIgnoreGlob", localesIgnoreGlob);

  // 这里可以给arcgis提个PR，这个目录下的国际化资源没有删除掉
  // \build\assets\esri\widgets\ScaleRangeSlider\images\scalePreview
  const widgetsIgnoreList = locales.map((locale) => `${locale}`).join("|");
  const widgetsIgnoreGlob =  `**/widgets/**/!(${widgetsIgnoreList.toLowerCase()}).jpg`;

  console.log("widgetsIgnoreGlob", widgetsIgnoreGlob);

  const ignoreSass = "**/*.scss";

  // 排除的目录
  const themeIgnoreList = excludeThemes.map((theme)=> `${theme}`).join(',');
  const excludeThemesIgnoreGlob = `**/themes/{${themeIgnoreList}}/main.css`;
  console.log("excludeThemesIgnoreGlob", excludeThemesIgnoreGlob);

  return [
    // Copy non-packed resources needed by the app to the build directory
    new CopyWebpackPlugin({
      patterns: [
        // assets
        {
          context: "node_modules",
          from: `${jsapi}/assets`,
          to: "assets",
          globOptions: {
            // ignore the webscene spec folder, sass files,
            // and any locales not need for deployment
            ignore: ["**/webscene/spec/**", ignoreSass, localesIgnoreGlob, excludeThemesIgnoreGlob, widgetsIgnoreGlob],
          },
        },
      ],
    }),
  ];
};
