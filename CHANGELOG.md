
## 0.8.0 [11-06-2023]

* More migration changes

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!15

---

## 0.7.1 [09-12-2023]

* more migration & metadata changes

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!14

---

## 0.7.0 [08-16-2023]

* Minor/2023 migration

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!13

---

## 0.6.0 [08-11-2023]

* Minor/2023 migration

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!13

---

## 0.5.0 [05-30-2023]

* Minor/adapt 2429

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!11

---

## 0.4.0 [08-08-2022]

* Add Session Management Capability

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!9

---

## 0.3.1 [06-21-2022]

* Changes for Authentication and Healthcheck

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!8

---

## 0.3.0 [05-29-2022]

* Migration to the latest Adapter Foundation

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!7

---

## 0.2.6 [03-02-2022]

- Improve sample properties with tested config

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!6

---

## 0.2.5 [03-02-2021]

- Migration to bring up to the latest foundation
  - Change to .eslintignore (adapter_modification directory)
  - Change to README.md (new properties, new scripts, new processes)
  - Changes to adapterBase.js (new methods)
  - Changes to package.json (new scripts, dependencies)
  - Changes to propertiesSchema.json (new properties and changes to existing)
  - Changes to the Unit test
  - Adding several test files, utils files and .generic entity
  - Fix order of scripts and dependencies in package.json
  - Fix order of properties in propertiesSchema.json
  - Update sampleProperties, unit and integration tests to have all new properties.
  - Add all new calls to adapter.js and pronghorn.json
  - Add suspend piece to older methods

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!5

---

## 0.2.4 [07-07-2020]

- Update the adapter to the latest foundation

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!4

---

## 0.2.3 [02-13-2020]

- Made changes to the authentication process based on findings about checkpoint management - also changed the base path based on these findings (there was no base path in the swagger). Adapter being tested by Kavan - if needed, more changes will follow

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!3

---

## 0.2.2 [01-16-2020] & 0.2.1 [01-02-2020]

- Bring the adapter up to the latest adapter foundation

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!2

---

## 0.2.0 [11-07-2019]

- Update the adapter to the latest adapter foundation.
  - Updating to adapter-utils 4.24.3 (automatic)
  - Add sample token schemas (manual)
  - Adding placement property to getToken response schema (manual - before encrypt)
  - Adding sso default into action.json for getToken (manual - before response object)
  - Add new adapter properties for metrics & mock (save_metric, mongo and return_raw) (automatic - check place manual before stub)
  - Update sample properties to include new properties (manual)
  - Update integration test for raw mockdata (automatic)
  - Update test properties (manual)
  - Changes to artifactize (automatic)
  - Update type in sampleProperties so it is correct for the adapter (manual)
  - Update the readme (automatic)

See merge request itentialopensource/adapters/security/adapter-checkpoint_management!1

---

## 0.1.1 [11-04-2019]

- Initial Commit

See commit 0776326

---
