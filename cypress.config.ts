import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";
import dotenv from "dotenv";

dotenv.config();

const baseUrl = process.env.BASE_URL;
const apiUrl = process.env.API_URL;

if (!baseUrl) {
  throw new Error("Missing BASE_URL environment variable");
}

if (!apiUrl) {
  throw new Error("Missing API_URL environment variable");
}

export default defineConfig({
  e2e: {
    baseUrl,
    specPattern: "**/*.feature",
    supportFile: "cypress/support/e2e.ts",
    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions,
    ): Promise<Cypress.PluginConfigOptions> {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      on("task", {
        async resetDatabase() {
          const response = await fetch(`${apiUrl}/test-utils/reset-database`, {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error(
              `Database reset failed with status ${response.status}`,
            );
          }

          return null;
        },
      });

      return config;
    },
  },
  env: {
    locale: "en",
    apiUrl,
  },
});