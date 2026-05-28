Feature: User settings page

  Background:
    Given I am a logged-in settings user

  Scenario: Authenticated user can navigate to settings
    When I navigate to the settings page
    Then I should see the settings page heading

  Scenario: User can change their password
    When I navigate to the settings page
    And I fill in the change password form with current "admin" and new "newpassword123"
    And I save my password
    Then I should see a password success message

  Scenario: User sees error when current password is wrong
    When I navigate to the settings page
    And I fill in the change password form with current "wrongpassword" and new "newpassword123"
    And I save my password
    Then I should see a password error message

  Scenario: User can log out from the settings page
    When I navigate to the settings page
    And I click the logout button
    Then I should see a logout confirmation
    When I confirm the logout
    Then I should be redirected to the login page
