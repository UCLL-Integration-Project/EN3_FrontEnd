Feature: User Profile
  As a logged-in user
  I want to view and edit my profile
  So that my information stays up to date

  Background:
    Given I am logged in as a user with username "johndoe", first name "John", last name "Doe", email "john@example.com", and age 30

  Scenario: Viewing the profile page
    When I navigate to the "/en/profile" page
    Then I should see the profile form
    And the "username" input should contain "johndoe"
    And the "firstName" input should contain "John"
    And the "lastName" input should contain "Doe"
    And the "email" input should contain "john@example.com"
    And the "age" input should contain "30"

  Scenario: Successfully editing profile information
    When I navigate to the "/en/profile" page
    And I change the "firstName" input to "Johnny"
    And I change the "age" input to "31"
    And I click the save button
    Then I should see a success message saying "Profile updated successfully."

  Scenario: Failing to edit with invalid data
    When I navigate to the "/en/profile" page
    And I clear the "firstName" input
    And I click the save button
    Then I should see validation errors for "firstName"
    And I should not see a success message
