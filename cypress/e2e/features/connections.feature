Feature: Connection Levels Management
  As a logged-in user
  I want to manage my connections with different levels
  So that I can categorize my relationships

  Background:
    Given I am logged in as "johndoe" with name "John Doe"
    And I have connections with levels:
      | username | firstName | lastName | level      |
      | user1    | Alice     | Smith    | CONTACT    |
      | user2    | Bob       | Jones    | FRIEND     |
      | user3    | Charlie   | Brown    | BEST_FRIEND|

  Scenario: Viewing connections with their levels
    When I navigate to the "/en/connections" page
    Then I should see 3 connections
    And I should see "Alice Smith" with level "Contact"
    And I should see "Bob Jones" with level "Friend"
    And I should see "Charlie Brown" with level "Best Friend"

  Scenario: Changing a connection level from Contact to Friend
    When I navigate to the "/en/connections" page
    And I click the level button for "Alice Smith"
    Then the level dropdown should open
    And I should see options "Contact", "Friend", "Best Friend"
    When I select "Friend"
    Then the level button should show "Friend"
    And the connection level should be updated

  Scenario: Changing a connection level from Friend to Best Friend
    When I navigate to the "/en/connections" page
    And I click the level button for "Bob Jones"
    And I select "Best Friend"
    Then the level button should show "Best Friend"
    And the connection level should be updated

  Scenario: Changing a connection level to Contact
    When I navigate to the "/en/connections" page
    And I click the level button for "Charlie Brown"
    And I select "Contact"
    Then the level button should show "Contact"
    And the connection level should be updated

  Scenario: Closing the dropdown without changing level
    When I navigate to the "/en/connections" page
    And I click the level button for "Alice Smith"
    Then the level dropdown should open
    When I click the level button again
    Then the level dropdown should close
    And the level should still be "Contact"

  Scenario: Removing a connection
    When I navigate to the "/en/connections" page
    And I click the remove button for "Alice Smith"
    Then "Alice Smith" should no longer be in the connections list
    And I should see 2 connections remaining

  Scenario: Empty connections list
    Given I have no connections
    When I navigate to the "/en/connections" page
    Then I should see "You have no connections yet."
    And I should not see any connection items
