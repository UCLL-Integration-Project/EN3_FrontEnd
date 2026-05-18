Feature: Social User Profile
  As a logged-in user
  I want my profile to look like a social media profile
  And I want to be able to view and connect with others

  Background:
    Given I am logged in as "johndoe" with name "John Doe"

  Scenario: Viewing my own social profile
    When I navigate to the "/en/profile" page
    Then I should see my banner and avatar
    And I should see my name "John Doe" and username "@johndoe"
    And I should see an "Edit Profile" button
    And I should see the "About" section with my bio
    And I should see the "Activity" section

  Scenario: Toggling edit mode on my profile
    When I navigate to the "/en/profile" page
    And I click the "Edit Profile" button
    Then I should see the profile edit form
    And I should see inputs for "bio", "avatarUrl", and "bannerUrl"
    When I click the "Cancel" button
    Then I should be back in the social profile view

  Scenario: Viewing another user's public profile
    Given a user "janedoe" exists with name "Jane Smith" and bio "Hello world"
    When I navigate to the "/en/profile/janedoe" page
    Then I should see Jane's banner and avatar
    And I should see the name "Jane Smith" and username "@janedoe"
    And I should see a "Connect" button
    And I should not see an "Edit Profile" button
    When I click the "Connect" button
    Then the button should change to "Connected"
    And the connection count should increase
