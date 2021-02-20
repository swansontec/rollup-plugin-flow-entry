# rollup-plugin-flow-entry

## 0.3.5 (2021-02-20)

- Fix to work with the latest @rollup/plugin-multi-entry.

## 0.3.4 (2020-03-16)

- Use Rollup's `this.emitFile` to generate output instead of directly writing to the bundle, which is deprecated.

## 0.3.3 (2019-09-30)

- Add a `types` option to control the input location.
- Fix path-manipulation & escaping bugs.
  - Output files in sub-folders would have incorrect input paths.
  - String escaping did not handle `'` characters.
- Upgrade build tooling.

## 0.3.2 (2019-03-01)

- Fix path handling when the input & output locations are the same.

## 0.3.1 (2019-03-01)

- Add the option to enable strict type checking.

## 0.3.0 (2019-02-05)

- Work correctly with Rollup's built-in code splitting.
- Do not write entry files directly to disk, but insert them into the generated bundle for Rollup itself to write.

## 0.2.2 (2019-01-25)

- Create the destination directory if it is missing.

## 0.2.1

- Stop using deprecated hook for better compatibility with rollup v1.0.0.

## 0.2.0

- Fix compatibility with rollup-plugin-multi-entry.
- Add unit test.

## 0.1.1

- Fix a packaging bug.

## 0.1.0

- Initial release.
