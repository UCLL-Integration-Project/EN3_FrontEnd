Feature: Login page

  Scenario: Guest sees the login form
    Given I am a visitor on the login page
    Then I should see the login form

  Scenario: Empty form submission shows validation errors
    Given I am a visitor on the login page
    When I submit the empty login form
    Then I should see login validation errors

  Scenario: Invalid credentials shows an error
    Given I am a visitor on the login page
    When I log in with email "bad@example.com" and password "wrongpass"
    Then I should see an invalid credentials error

  Scenario: Correct credentials shows a success message
    Given I am a visitor on the login page
    When I log in with email "user@example.com" and password "correctpass"
    Then I should see the login success message

  Scenario: Logged-in user is redirected away from the login page
    Given I visit the login page while already logged in
    Then I should be redirected away from login
