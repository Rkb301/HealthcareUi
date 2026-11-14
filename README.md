# Healthcare Management UI — Angular

Angular frontend for a healthcare-management application, developed as part of a software engineering internship project. It demonstrates component-driven frontend development, forms, routing, HTTP integration, and workflows around patients, doctors, and appointments.

## Technology

- Angular 20, TypeScript, RxJS
- Angular Material and CDK
- HTTP requests to an ASP.NET Core backend
- Tabulator tables, SweetAlert2, and Luxon

## Related backend

See [HealthcareApi](https://github.com/Rkb301/HealthcareApi) for the ASP.NET Core API, database models, authorization and Lucene.NET search implementation. The frontend is not a standalone application: many features require the API, its configured database and appropriate test accounts.

## Run locally

1. Install a Node.js version compatible with Angular 20 (Node.js 20.19+, 22.12+ or 24+).
2. Run `npm ci` in this repository.
3. Configure the [HealthcareApi](https://github.com/Rkb301/HealthcareApi) project with local SQL Server and development credentials; apply its migrations, and start it.
4. The frontend currently uses **http://localhost:5122** for API calls in several components. The API must serve that origin, or you must update the frontend API base URLs to match your local server.
5. Start the frontend with `npm start` (or `npx ng serve`) and open **http://localhost:4200**.

## Useful commands

```bash
npm ci
npm start
npm run build
npm test
```

`npm run build` builds the production configuration. Angular may report optimization and stylesheet budget warnings; the threshold is configured in `angular.json` and should be reviewed after future dependency or feature changes.

## Source layout

| Path | What it contains |
| --- | --- |
| `src/app/components/` | Healthcare-management views and dialogs |
| `src/app/` | Angular application setup, services, and models |
| `src/styles.scss` | Global styling |
| `angular.json` | CLI builds, assets and optimization limits |

## Limitations and security

- **Portfolio/demo code only**: not validated or certified for clinical deployment.
- Use synthetic patient and appointment records when running locally.
- The application uses development-local backend endpoints. Production use requires environment configuration, authentication hardening and CORS review.
- No independent e2e test harness is currently included in the package scripts. Unit-test files exist, but their pass status should be verified for each change.
- Avoid publishing credentials, real personal health information, production screenshots, or database dumps.

**Portfolio focus:** Angular · TypeScript · frontend architecture · full-stack integration · healthcare workflow UI
