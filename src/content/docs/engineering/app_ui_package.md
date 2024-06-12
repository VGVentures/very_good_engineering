---
title: App UI Package
description: Separate common UI components into a separate package.
---

When designing an application, it is common to have "pieces of UI" that are often repeated in many
different pages/features.

To avoid repeating the same code over and over again, it is a good idea to extract such "pieces of UI"
into generic, reusable widgets.

Code reutilization is not the only benefit of such approach. A great addition is that it
advocates for a better design consistency.

Instead of creating the same widget in many places, the same generic widget is reused.
As the design of the app evolves, there are fewer opportunities for pieces of the app to look different..

Following the best practices presented in the [Domains and modules](./domains_and_modules.md) guide
, we suggest moving these reusable widgets in a separate package, and this page presents the
suggested structure for such package.


## 📝 Requirements to add a Widget to the UI package

Not all widgets in an app should be added to this package. In order for a widget to be added, it
has to be **generic** and **reusable**, meaning that it has no specific business logic tied to it.

For example, a button can perform a save operation, it can hide a section of page, etc. All those
are specific actions. A generic button would not specify its own action or label. Instead,
they would be determined by configurable properties.

Some widgets that seem specific, could also be considered generic. For example a widget
that displays the user profile photo.

A User's profile photo can be considered a domain specific context to our application. That might
make us think that it is then by nature a non generic widget.

If the widget is built in a generic way, developers could use it in many different
situations. For example, a widget that just receives a string url of the picture; it is still a
generic component and can be added in the package.

Widgets in this package should also be self contained. Meaning that they can **have state**, as
long as such state **only concerns their own behavior**. A common example is an animated
switch/checkbox. Such widget might need to manage an internal state in order to build its animation
and render itself when it is selected or not.

As long as that state is internal and only used for its own behavior, it is totally ok for it
to be stateful.

To sum up, widgets that are generic, reusable, and/or stylized according the visual definition
of the app (i.e. design system), should be placed in this package.

For a real life example, check it out the UI package from the
[IO Flip project](https://github.com/flutter/io_flip/tree/main/packages/io_flip_ui).


## 🏛️ Structure

There isn't anything too special about how this package should be structured other than just
the common best practices that are applied to any package/plugin, such as:

- Source of files under `lib/src`, exported by a barrel file.
- Tests for all widgets.
- CI
- Etc.

> ℹ️ Creating the package via `very_good` cli is preferred since all the above
> practices are created out of the box.


## 🏖️ Sandbox

A sandbox is a great tool that allow developers to:

- Create a searchable catalog of widgets.
- Develop generic widgets outside of the main app, boosting productivity since there is no need to
run the main app and follow sometimes long flows to reach the place where the widget in development
is being show.

At VGV, we suggest that the sandbox within an app package is a flutter application, named
`gallery` inside the package, similarly how publishable packages have an `example` app inside
them. To organize the sandbox, we suggest the use of
[`Dashbook`](https://github.com/bluefireteam/dashbook), a [StorybookJS](https://storybook.js.org/)
inspired library, but for flutter.


### Using Dashbook to organize the sandbox

Dashbook provides an easy and opinionated way of organizing a catalog of widgets. In it, developers
creates groups, called stories, of widgets examples, called chapters.

To put this in a more tangible example, lets think in the `AppButton` widget. This button can be
of type primary or secondary.

This widget in itself would be a story called `AppButton` which would have a `primary`and `secondary`
chapters as children of it.

Behavior variations could also be other chapters, like `disabled` for example. And ideally, each
story should have a default chapter, which shows the most common usage of such widget, which in this
example of ours, would be the enabled, primary `AppButton`.

We can see below how our gallery app would look in practice:

```text
lib/
 |- stories/
 |    |- app_button_stories.dart
 |    |- stories.dart
 |- main.dart
```

The `main.dart` would look like:

```dart
import 'package:gallery/stories.dart';
import 'package:dashbook/dashbook.dart';
import 'package:flutter/material.dart';

void main() {
  final dashbook = Dashbook();

  addAppButtonStories(dashbook);

  runApp(dashbook);
}
```

The `app_button_stories.dart`:

```dart
void addAppButtonStories(Dashbook dashbook) {
  dashbook
    .storiesOf('AppButton')
    .add('default', (context) {
      return AppButton(title: 'AppButton');
    })
    .add('primary', (context) {
      return AppButton(title: 'AppButton', primary: true);
    })
    .add('secondary', (context) {
      return AppButton(title: 'AppButton', primary: false);
    })
    .add('disabled', (context) {
      return AppButton(title: 'AppButton', disabled: true);
    });
}
```

Dashbook provides additional and more advanced APIs which are not covered by this guide. For a
deeper dive into all that it has to offer, be sure to check the package
[repository](https://github.com/bluefireteam/dashbook).

> ℹ️ Creating the gallery app via `mason`, using the `dashbook_gallery` brick
> will get the sandbox created with the structure explained above with a single
> command run.
