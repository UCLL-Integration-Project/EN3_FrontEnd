Feature: Stats Page
  As a logged-in user
  I want to see a stats page
  So that I can see how I have been using the app

  Background:
    Given I am a logged-in stats user

  Scenario: Viewing stats with activity
    Given my stats show 5 connections, 90 minutes active, and 3 data shared
    When I navigate to the "/en/stats" page
    Then I should see "5" as the connections stat
    And I should see "1h 30m" as the time active stat
    And I should see "3" as the data shared stat

  Scenario: Empty state for a new user
    Given my stats are empty
    When I navigate to the "/en/stats" page
    Then I should see the stats empty state

  Scenario: Refreshing stats without logging out
    Given my stats show 5 connections, 90 minutes active, and 3 data shared
    When I navigate to the "/en/stats" page
    And my stats update to 6 connections
    And I click the stats refresh button
    Then I should see "6" as the connections stat
