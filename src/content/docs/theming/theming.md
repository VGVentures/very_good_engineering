---
title: 🎨 Theming
description: Theming best practices.
---

The theme plays a crucial role in defining the visual properties of an app, such as colors, typography, and other styling attributes. Inconsistencies within the theme can result in poor user experiences and potentially distort the intended design. Fortunately, Flutter offers a great design system that enables us to develop reusable and structured code that ensures a consistent theme.

:::note
Flutter uses [Material Design](https://docs.flutter.dev/ui/design/material) with [Material 3](https://m3.material.io/develop/flutter) enabled by default as of the Flutter 3.16 release.
:::

:::tip[Did you know?]
Not everyone in the community is happy about Material and Cupertino being baked into the framework. Check out these discussions:

- https://github.com/flutter/flutter/issues/101479
- https://github.com/flutter/flutter/issues/110195
  :::

## Use ThemeData

By using `ThemeData`, widgets will inherit their styles automatically which is especially important for managing light/dark themes as it allows referencing the same token in widgets and removes the need for conditional logic.

Bad ❗️

```dart
class BadWidget extends StatelessWidget {
  const BadWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Theme.of(context).brightness == Brightness.light
          ? Colors.white
          : Colors.black,
      child: Text(
        'Bad',
        style: TextStyle(
          fontSize: 16,
          color: Theme.of(context).brightness == Brightness.light
              ? Colors.black
              : Colors.white,
        ),
      ),
    );
  }
}
```

The above widget might match the design and visually look fine, but if you continue this structure, any design updates could result in you changing a bunch of files instead of just one.

Good ✅

```dart
class GoodWidget extends StatelessWidget {
  const GoodWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return ColoredBox(
      color: colorScheme.surface,
      child: Text(
        'Good',
        style: textTheme.bodyLarge,
      ),
    );
  }
}
```

Now, we are using `ThemeData` to get the `ColorScheme` and `TextTheme` so that any design update will automatically reference the correct value.

## Avoid Conditional Logic

It's generally recommended to steer clear of using conditional logic in UI for theming. This approach can complicate testing and make the code less readable. By leveraging Flutter's built-in design system, your app can have cleaner, more maintainable code that ensures consistent styling.
