---
title: Golden file testing
description: Golden testing best practices.
---

The term golden file refers to a master image that is considered the true rendering of a given widget, state, application, or other visual representation you have chosen to capture.

:::note
To learn more about Golden file testing refer to [Testing Fundamentals video about Using Golden Files to Verify Pixel-Perfect Widgets](https://www.youtube.com/watch?v=_G6GuxJF44Q&list=PLprI2satkVdFwpxo_bjFkCxXz5RluG8FY&index=22) or to the [Flutter matchesGoldenFile documentation](https://api.flutter.dev/flutter/flutter_test/matchesGoldenFile.html).
:::

## Tag golden tests

Golden tests should be tagged to make it easier to run them separately from other tests.

Bad ❗️

```dart
testWidgets('render matches golden file', (WidgetTester tester) async {
  await tester.pumpWidget(MyWidget());

  await expectLater(
    find.byType(MyWidget),
    matchesGoldenFile('my_widget.png'),
  );
});
```

Good ✅

```dart
  testWidgets(
    'render matches golden file',
    tags: TestTag.golden,
    (WidgetTester tester) async {
      await tester.pumpWidget(MyWidget());

      await expectLater(
        find.byType(MyWidget),
        matchesGoldenFile('my_widget.png'),
      );
    },
  );
```

:::tip
[You should avoid using magic strings to tag test](../testing/#avoid-using-magic-strings-to-tag-test). Instead, use constants to tag tests. This helps to avoid typos and makes it easier to refactor.
:::

### Configure your golden test tag

To configure a golden test tag across multiple files or an entire package create a `dart_test.yaml` file and add the tag configuration:

```
tags:
  golden:
    description: "Tests that compare golden files."
```

:::note
Learn more about all the `dart_test.yaml` configuration options in the [Dart Test Configuration documentation](https://github.com/dart-lang/test/blob/master/pkgs/test/doc/configuration.md).
:::

You can then run the tests with the tag `golden` in isolation, or quickly update
the golden files with the `--update-goldens` flag:

```bash
flutter test --tags golden # Run only golden tests
flutter test --tags golden --update-goldens # Update golden files
```
