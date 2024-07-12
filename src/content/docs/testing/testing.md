---
title: Testing
description: Testing best practices.
---

At Very Good Ventures, our goal is to achieve 100% test coverage on all projects. Writing tests not only helps to reduce the number of bugs, but also encourages code to be written in a very clean, consistent, and maintainable way. While testing can initially add some additional time to the project, the trade-off is fewer bugs, higher confidence when shipping, and less time spent in QA cycles.

## Organize test files

Test files should be organized to match your project file structure.

This `my_package` library contains `models` and `widgets`. The `test` folder should copy this structure:

```txt
my_package/
  |- lib/
  |   |- models/
  |   |   - model_a.dart
  |   |   - model_b.dart
  |   |   - models.dart
  |   |- widgets/
  |   |   - widget_1.dart
  |   |   - widget_2.dart
  |   |   - widgets.dart
  |- test/
      ...
```

Bad ❗️

```txt
test/
  |- model_a_test.dart
  |- model_b_test.dart
  |- widgets_test.dart
```

Good ✅

```txt
test/
  |- models/
  |   - model_a_test.dart
  |   - model_b_test.dart
  |- widgets/
  |   - widget_1_test.dart
  |   - widget_2_test.dart
```

> Note: `models.dart` and `widgets.dart` are barrel files and do not need to be tested.

> Tip: You can automatically create or find a test file when using the [Flutter VS Code Extension](https://docs.flutter.dev/tools/vs-code) by right-clicking on the file within the [explorer view](https://code.visualstudio.com/docs/getstarted/userinterface#_explorer-view) and selecting "Go to test" or using the ["Go to test"](https://github.com/Dart-Code/Dart-Code/blob/09cb9828b7b315d667ee5dc97e9287a6c6c8655a/package.json#L323) command within the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).

> Note: You can find more information about package layouts in the [Dart Package layout conventions](https://dart.dev/tools/pub/package-layout) and in [What makes a package](https://dart.dev/guides/libraries/create-packages#what-makes-a-package).

## Assert test results using expect or verify

All tests should have one or more statements at the end of the test asserting the test result using either an [expect](https://api.flutter.dev/flutter/flutter_test/expect.html) or [verify](https://pub.dev/documentation/mocktail/latest/).

Bad ❗️

```dart
testWidgets('can tap widget', (tester) async {
  await tester.pumpWidget(SomeTappableWidget());
  await tester.pumpAndSettle();

  await tester.tap(SomeTappableWidget());
  await tester.pumpAndSettle();
});
```

The above test would pass coverage on `SomeTappableWidget`, and pass as long as no exception is thrown, but it doesn't really tell any valuable information about what the widget should do.

Good ✅

```dart
testWidgets('calls [onTap] on tapping widget', (tester) async {
  var isTapped = false;
  await tester.pumpWidget(SomeTappableWidget({
          onTap: isTapped = true,
        }
      ),
    );
  await tester.pumpAndSettle();

  await tester.tap(SomeTappableWidget());
  await tester.pumpAndSettle();

  expect(isTapped, isTrue);
});
```

Now, we are explicitly testing that we have accessed the `onTap` property of `SomeTappableWidget`, which makes this test more valuable, because its behavior is also tested.

## Use matchers and expectations

[Matchers](https://api.flutter.dev/flutter/package-matcher_matcher/package-matcher_matcher-library.html) provides better messages in tests and should always be used in [expectations](https://api.flutter.dev/flutter/flutter_test/expect.html).

Bad ❗️

```dart
expect(name, 'Hank');
expect(people.length, 3);
expect(valid, true);
```

Good ✅

```dart
expect(name, equals('Hank'));
expect(people, hasLength(3));
expect(valid, isTrue);
```

## Descriptive test

Don't be afraid of being verbose in your tests. Make sure everything is readable, which can make it easier to maintain over time.

Bad ❗️

```dart
testWidgets('renders', (tester) async {});
test('works', () async {});
blocTest<YourBloc, RecipeGeneratorState>('emits',);
```

Good ✅

```dart
testWidgets('renders YourView', (tester) async {});
testWidgets('renders YourView for YourState', (tester) async {});
test('given an [input] is returning the [output] expected', () async {});
blocTest<YourBloc, RecipeGeneratorState>('emits StateA if ...',);


```

## Test with a single purpose

Aim to test one scenario per test. You might end up with more tests in the codebase, but this is preferred over creating one single test to cover several cases. This helps with readability and debugging failing tests.

Bad ❗️

```dart
testWidgets('renders widgetA and widgetB', (tester) async {});
```

Good ✅

```dart
testWidgets('renders widgetA', (tester) async {});
testWidgets('renders widgetB', (tester) async {});
```

## Use keys carefully

Although keys can be an easy way to look for a widget while testing, they tend to be harder to maintain, especially if we use hard-coded keys. Instead, we recommend finding a widget by its type.

Bad ❗️

```dart
 expect(find.byKey(Key('homePageKey')), findsOneWidget);
```

Good ✅

```dart
 expect(find.byType(HomePage), findsOneWidget);
```

## Use private mocks

Developers may reuse mocks across different test files. This could lead to undesired behaviors in tests. For example, if you change the default values of a mock in one class, it could effect your test results in another. In order to avoid this, it is better to create private mocks for each test file.

Bad ❗️

```dart
class MockYourClass extends Mock implements YourClass {}

```

Good ✅

```dart
class _MockYourClass extends Mock implements YourClass {}
```

## Split your tests by groups

Having multiple tests in a class could cause problems with readability. It is better to split your tests into groups:

- Widget tests: you could potentially group by "renders", "navigation", etc.
- Bloc tests: group by the name of the event.
- Repositories and clients: group by name of the method you are testing.

> Tip: If your test file starts to become unreadable or unmanageable, consider splitting the file
> that you are testing into smaller files.

## Keep test setup inside a group

When running tests through the `very_good` CLI's optimization, all test files become a single file.

If test setup methods are outside of a group, those setups may cause side effects and make tests fail due to issues that wouldn't happen when running without the optimization.

In order to avoid such issues, refrain from adding `setUp` and `setUpAll` (as well as `tearDown` and `tearDownAll`) methods outside a group:

Bad ❗️

```dart
void main() {
  late ApiClient apiClient;

  setUp(() {
    apiClient = _MockApiClient();
    // mock api client methods...
  });

  group('UserRepository', () {
    // Tests...
  });
}
```

Good ✅

```dart
void main() {
  group('UserRepository', () {
    late ApiClient apiClient;

    setUp(() {
      apiClient = _MockApiClient();
      // mock api client methods...
    });

    // Tests...
  });
}
```

## Shared mutable objects should be initialized per test

We should ensure that shared mutable objects are initialized per test. This avoids the possibility of tests affecting each other, which can lead to flaky tests due to unexpected failures during test parallelization or random ordering.

Bad ❗️

```dart
class _MySubjectDependency {
  var value = 0;
}

class _MySubject {
  // Although the constructor is constant, it is mutable.
  const _MySubject(this._dependency);

  final _MySubjectDependency _dependency;

  get value => _dependency.value;

  void increase() => _dependency.value++;
}

void main() {
  group('$_MySubject', () {
    final _MySubjectDependency myDependency = _MySubjectDependency();

    test('value starts at 0', () {
      // This test assumes the order tests are run.
      final subject = _MySubject(myDependency);
      expect(subject.value, equals(0));
    });

    test('value can be increased', () {
      final subject = _MySubject(myDependency);

      subject.increase();

      expect(subject.value, equals(1));
    });
  });
}

```

Good ✅

```dart

void main() {
  group('$_MySubject', () {
    late _MySubjectDependency myDependency;

    setUp(() {
      myDependency = _MySubjectDependency();
    });

    test('value starts at 0', () {
      // This test no longer assumes the order tests are run.
      final subject = _MySubject(myDependency);
      expect(subject.value, equals(0));
    });

    test('value can be increased', () {
      final subject = _MySubject(myDependency);

      subject.increase();

      expect(subject.value, equals(1));
    });
  });
}

```
