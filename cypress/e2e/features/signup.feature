Feature: Signup page

  Scenario: Guest sees the signup form
    Given I am a visitor on the signup page
    Then I should see the signup form

  Scenario: Empty form submission shows validation errors
    Given I am a visitor on the signup page
    When I submit the empty signup form
    Then I should see signup validation errors

  Scenario: Weak password shows a validation error
    Given I am a visitor on the signup page
    When I fill in the signup form with a weak password "short"
    Then I should see a weak password error

  Scenario: Successful signup shows a success message
    Given I am a visitor on the signup page
    When I fill in and submit the signup form with valid data
    Then I should see the signup success message

  Scenario: Username already taken shows an error
    Given I am a visitor on the signup page
    When I fill in and submit the signup form with a taken username
    Then I should see a username taken error

  Scenario: Logged-in user is redirected away from the signup page
    Given I visit the signup page while already logged in
    Then I should be redirected away from signup
