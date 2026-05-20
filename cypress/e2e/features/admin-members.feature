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
