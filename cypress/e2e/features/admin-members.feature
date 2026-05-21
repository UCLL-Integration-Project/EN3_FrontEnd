Feature: Admin members — list, search, detail and moderation
  As an admin
  I want to find, inspect and moderate members
  So that I can keep the board healthy

  Background:
    Given the database is reset
    And I am logged in as the admin

  Scenario: Search finds a member by name
    When I open the admin members page
    And I search the members list for "jane"
    Then I should see "Jane Doe" in the list
    And I should not see "John Smith" in the list

  Scenario: Open a member from the list and return with search preserved
    When I open the admin members page
    And I search the members list for "jane"
    And I open the member named "Jane Doe"
    Then I should land on the member detail page
    And I should see "Jane Doe" on the detail page
    When I go back to the members list
    Then I should be on the members list
    And the search should still be "jane"

  Scenario: Suspend a member and see the audit entry
    When I open the admin members page
    And I open the member named "Jane Doe"
    And I suspend the member with note "repeated policy violations"
    Then the member status should be "Suspended"
    And the audit log should show a "suspended this member" entry
