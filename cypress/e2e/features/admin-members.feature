Feature: Admin members — list & search
  As an admin
  I want a searchable list of members
  So that I can find a specific person quickly

  Background:
    Given the database is reset

  Scenario: Search finds a member by name
    Given I am logged in as the admin
    When I open the admin members page
    And I search the members list for "ada"
    Then I should see "Ada Admin" in the list
    And I should not see "Jane Doe" in the list

  Scenario: Open a member from the list and return with search preserved
    Given I am logged in as the admin
    When I open the admin members page
    And I search the members list for "admin"
    And I open the member named "Admin User"
    Then I should land on the member detail page
    And I should see "Admin User" on the detail page
    When I go back to the members list
    Then I should be on the members list
    And the search should still be "admin"
