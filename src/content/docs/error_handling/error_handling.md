---
title: Error handling
description: Error handling best practices.
---

## Document when a call may throw

Inform about the potential risks associated with calling a function, helping understand under what conditions an exception might be thrown.

This transparency allows developers to handle exceptions properly, leading to more robust and error-resistant code. Thus, reducing the likelihood of unintended errors.

<Tabs>
  <TabItem label="Good ✅">

```dart
/// Deletes permanently an account with the given [name].
///
/// Throws:
///
/// * [UnauthorizedException] if the active role is not [Role.admin], since only
///  admins are authorized to delete accounts.
void deleteAccount(String name) {
  if (activeRole != Role.admin) {
    throw UnauthorizedException('Only admin can delete account');
  }
  // ...
}
```

  </TabItem>
  <TabItem label="Bad ❗️">

```dart
/// Deletes permanently an account with the given [name].
void deleteAccount(String name) {
  if (activeRole != Role.admin) {
    throw UnauthorizedException('Only admin can delete account');
  }
  // ...
}
```

  </TabItem>
</Tabs>

## Define descriptive exceptions

Implement `Exception` with descriptive names rather than simply throwing a generic `Exception`.

By creating custom exceptions, developers can provide more meaningful error messages and handle different error types in a more granular way. This enhances code readability and maintainability, as it becomes clear what type of error is being dealt with.

<Tabs>
  <TabItem label="Good ✅">

```dart
class UnauthorizedException implements Exception {
  UnauthorizedException(this.message);

  final String message;

  @override
  String toString() => 'UnauthorizedException: $message';
}

void deleteAccount(String name) {
  if (activeRole != Role.admin) {
    throw UnauthorizedException('Only admin can delete account');
  }
  // ...
}

void main() {
  try {
    deleteAccount('user');
  } on UnauthorizedException catch (e) {
    // Handle the exception.
  }
}

```

  </TabItem>
  <TabItem label="Bad ❗️">

```dart
void deleteAccount(String name) {
  if (activeRole != Role.admin) {
    throw Exception('Only admin can delete account');
  }
  // ...
}

void main() {
  try {
    deleteAccount('user');
  } on Exception catch (e) {
    // Exception is a marker interface implemented by all core library exceptions,
    // it is very generic and it could be catching many different types of exceptions,
    // lacking intent and making the code harder to understand.
  }
}
```

  </TabItem>
</Tabs>
