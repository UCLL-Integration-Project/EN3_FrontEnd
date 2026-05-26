Feature: Home screen

  Scenario: Guest sees the landing page
    Given I visit the home page as a guest
    Then I should see the "Get started" call to action
    And I should see the "I already have an account" link

  Scenario: Logged-in user sees the home screen with navigation
    Given I visit the home page as a logged-in user
    Then I should see the home screen navigation items
    And I should see the sign-out button

  Scenario: Admin user sees the admin navigation item
    Given I visit the home page as a logged-in admin
    Then I should see the home screen navigation items
    And I should see the admin navigation item
