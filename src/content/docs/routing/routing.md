---
title: 🚗 Routing
description: Routing best practices.
---

Routing is a crucial component of any app. A declarative routing structure is essential for building scalable apps that function seamlessly on both mobile and web platforms. At VGV, we recommend using the [GoRouter](https://pub.dev/packages/go_router) package for handling navigation needs, as it provides a robust and flexible solution for managing routes.

### GoRouter

[GoRouter](https://pub.dev/packages/go_router) is a popular routing package that is maintained by the Flutter team. It is built on top of the Navigator 2.0 API and reduces much of the boilerplate code that is required for even simple navigation. It is a declarative routing package with a URL-based API that supports parsing path and query parameters, redirection, sub-routes, and multiple navigators. GoRouter works great wheather your app is running as a mobile app or a web app.

### Configuration

Configuring your routes correctly is a must to be able to deep link to the correct page or to navigate to pages based on your app's state, like redirecting the user to the login page if the user is not authenticated.

Structure your routes in a way that makes logical sense. Avoid placing all of your routes on the root path:

Bad ❗️

```txt
/
/flutter
/flutter-news
/flutter-chat
/android
/android-news
/android-chat
```

Instead, use sub-routes.

Good ✅

```txt
/
/flutter
/flutter/news
/flutter/chat
/android
/android/news
/android/chat
```

Not only does using sub-routes make the path more readable, it also ensures that the app can navigate backwards correctly from the `news` page.

### Prefer `go` over `push` methods

GoRouter offers multiple ways to navigate to a route, such as pushing every route onto the stack and navigating to a route's path.

When possible, use GoRouter's `go` methods for navigation. Using `go` will push a new route onto the navigation stack according to your route's path. Using `go` will also update the path in your browser's URL address bar.

```txt
/
/flutter/
/flutter/news
```

Use the `push` method for navigation if you are expecting to return data from a pushed route when popped. A common scenario for this is when pushing a dialog onto the stack and expecting input from the user. You don't want the address bar to update with the path to the dialog, and you will never be expcted to route the user directly to the dialog, like from a deep link.

:::note
Though it is possible to update the path in the URL address bar by adding

```dart
GoRouter.optionURLReflectsImperativeAPIs = true;
```

to your code, it is not recommended unless you are in the process of [migrating](https://docs.google.com/document/d/1VCuB85D5kYxPR3qYOjVmw8boAGKb7k62heFyfFHTOvw/edit) to GoRouter 8.0.0.
:::

The `go` and `push` methods will both add the new page to the navigation stack, but `push` only adds the page to the stack. Using `go` will push the entire route to the stack. For example: The user is on the home page (`/`) and `go` is used to navigate the user directly to the `/flutter/news` route. If the user navigates backwards, the current route would be `/flutter`. If the user was `push`ed to the `/flutter/news` route instead, the back button would take the user to the `/` route.

:::note
In a Flutter web app, the browser's back button will still function as usual regardless of the navigation method that is used.
:::

#### Use hyphens for separting words in a URL

Mobile app users will likely never see your route's path, while web app users can easily view it in the browser's URL address bar. Your routing structure should be consistent and defined with the web in mind. Not only does this make your paths easier to read, but if you later decide to deploy your mobile app to the web, no changes regarding the path would be required.

Good ✅

```txt
/user/update_address
```

Bad ❗️

```txt
/user/update_address
/user/updateAddress
```

:::note
For a full list of URL structure best practices, take a look at this [document](https://developers.google.com/search/docs/crawling-indexing/url-structure) from Google.
:::

#### Prefer navigating by name over path

GoRouter offers two different options when navigation to a route, either by path or by name.

Because your app's structure and paths can change over time, we recommend routing by name to avoid potential issues of a route's path getting out of sync.

Good ✅

```dart
context.goNamed(routeName);
```

Consider this situation: An app has a `GoRoute` defined with the path `/flutter-news` for the `FlutterNewsPage`.

```dart
GoRoute(
  name: 'flutterNews',
  path: '/flutter-news',
  builder: (context, state) => return FlutterNewsPage();
)
```

Later, the pages in the app were reorganized and the path to the `FlutterNewsPage` has changed.

```dart
GoRoute(
  name: 'technology',
  path: '/technology',
  builder: (context, state) => return TechnologyPage();
  routes: [
    GoRoute(
      name: 'flutter',
      path: 'flutter',
      builder: (context, state) => return FlutterPage();
      routes: [
        GoRoute(
          name: 'flutterNews',
          path: 'news',
          builder: (context, state) => return FlutterNewsPage();
        ),
      ],
    ),
  ],
)
```

If the app was relying on the `path` to navigate the user to the `FlutterNewsPage` and the older path (`/flutter-news`) was used in an external deep link (or if the newer path (`/technology/flutter/news`) was used but the user hasn't updated to the latest version of the app), the route would not be found. However, when relying on the route `name`, navigation would work in either situation.

:::note
The route's `name` and `path` values should live as `const` values within the page's widget class. Hard coded strings are used in these examples for readability. However, the `GoRoute`'s `name` and `path` should not reference the same value.
:::

#### Extension methods

GoRouter provides extension methods on the `BuildContext` to simplify navigation. For consistency, use the extension method over the longer `GoRouter` methods.

Good ✅

```dart
context.goNamed('flutterNews');
```

Bad ❗️

```dart
GoRouter.of(context).goNamed('flutterNews');
```

### Navigating with parameters

Many times when navigating, you need to pass data from one page to another. GoRouter makes this easy by providing multiple ways to accomplish this: path parameters, query parameters, and an extra parameter.

#### Path parameters

Use path parameters when identifying a specific resource.

```txt
/article/whats-new-in-flutter
```

To navigate to the details page of a particular article, the `GoRoute` would look like this:

```dart
// ...
GoRoute(
  name: 'flutterArticle',
  path: 'article/:id',
  builder: (context, state) {
    final id = state.pathParameters['id'];
    return FlutterArticlePage(id: id);
  }
)
// ...
```

Navigating to that page with the article id is as simple as adding the `pathParameters` parameter with a `Map` containing the article `id`.

```dart
context.goNamed('flutterArticle', pathParameters: {'id': article.id});
```

#### Query parameters

Use query parameters when filtering or sorting resources.

```txt
/flutter/articles?date=07162024&category=all
```

To navigate to a page of filtered articles, the `GoRoute` would look like this:

```dart
// ...
GoRoute(
  name: 'flutterArticles',
  path: 'articles',
  builder: (context, state) {
    final date = state.uri.queryParameters['date'];
    final category = state.uri.queryParameters['category'];
    return FlutterArticlesPage(date: date, category: category);
  }
)
// ...
```

:::note
Unlike path parameters, query parameters do not have to be defined in your route path.
:::

To navigate to the list of filtered articles:

```dart
context.goNamed('flutterArticles', queryParameters: {'date': state.date, 'category': state.category});
```

#### Extra parameter

GoRouter has the ability to pass objects from one page to another. Most of the time, however, we avoid using the `extra` object when navigating to a new route. This value does not work on web and it cannot be used in deep linking.

Bad ❗️

```dart
context.goNamed('flutterArticles', extra: state.article);
```

```dart
GoRoute(
  name: 'flutterArticle',
  path: 'article',
  builder: (context, state) {
    final article = state.article;
    return FlutterArticlePage(article: article);
  }
)
```

In this example, we are passing the `article` object to the article details page. If your app is designed to only work on mobile and there are no plans of deep linking to the articles details page, then this is fine. But, if the requirements change and now you want to support the web or deep link users directly to the details of a particular article, changes will need to be made. Instead, pass the identifier of the article as a path parameter and fetch the article information from inside of your article details page.

Good ✅

```dart
context.goNamed('flutterArticle', pathParameters: {'id': state.article.id});
```

```dart
GoRoute(
  name: 'flutterArticle',
  path: 'article/:id',
  builder: (context, state) {
    final id = state.pathParameters['id'];
    return FlutterArticlePage(id: id);
  }
)
```

:::note
This does not necessarily mean that you have to make another network request to fetch the article information if you already have it. You may need to refactor your repository layer to retrieve the article information from the cache if the data has already been fetched, otherwise make the request to fetch the article information.
:::

### Redirects

Sometimes you need to redirect users to a different location in the app. For example: only signed-in users can access parts of your app. If the user isn't signed-in, you want to redirect the user to the sign in page. Fortunately, GoRouter makes this very easy and redirects can be done at the root and sub-route level.

```dart
class AppRouter {
  AppRouter({
    required AppBloc appBloc,
    required GlobalKey<NavigatorState> navigatorKey,
  }) {
    _goRouter = _routes(
      appBloc,
      navigatorKey,
    );
  }

  late final GoRouter _goRouter;

  GoRouter get routes => _goRouter;

  GoRouter _routes(
    AppBloc appBloc,
    GlobalKey<NavigatorState> navigatorKey,
  ) {
    return GoRouter(
      initialLocation: '/',
      refreshListenable: GoRouterRefreshStream(appBloc.stream),
      navigatorKey: navigatorKey,
      routes: [
        GoRoute(
          name: 'home',
          path: '/',
          builder: (context, state) => HomePage(),
        ),
        GoRoute(
          name: 'signIn',
          path: '/sign-in',
          builder: (context, state) => SignInPage(),
        ),
      ],
      redirect: (context, state) {
        final status == appBloc.state.status;

        if (status == AppStatus.unauthenticated) {
          return '/sign-in';
        }

        return null;
      }
    )
  }
}
```

Redirects on the parent routes are executed first. This is another reason why it is important to organize your URL hierarchy in a way where one redirect on a parent route can apply to all of the sub-routes.

In this example, the user is redirected to the `restricted` page if the user's status isn't `premium` and tries to access `/premium`, `/premium/show`, or `/premium/merch`. Having `shows` and `merch` as sub-routes avoids having to add redirect logic to each `GoRoute`.

```dart
GoRoute(
  name: 'premium',
  path: '/premium',
  builder: (context, state) => PremiumPage(),
  routes: [
    GoRoute(
      name: 'premiumShows',
      path: 'shows',
      builder: (context, state) => PremiumShowsPage(),
    ),
    GoRoute(
      name: 'premiumMerch',
      path: 'merch',
      builder: (context, state) => PremiumMerchPage(),
    ),
  ],
  redirect: (context, state) {
    final status == appBloc.state.user.status;

    if (status != UserStatus.premium) {
      return '/restricted';
    }

    return null;
  }
  GoRoute(
    name: 'restricted',
    path: '/restriced',
    builder: (context, state) => RestrictedPage(),
  ),
)
```
