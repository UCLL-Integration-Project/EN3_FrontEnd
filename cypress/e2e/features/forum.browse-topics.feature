Feature: Browse discussion posts

  Scenario: Authenticated student views forum posts
    Given I am logged in as "peterp" with password "peterp123"
    When I navigate to the forum page
    Then I should see a list of forum posts
    And I should see the forum post "Test Post on Software Engineering"

  Scenario: Unauthenticated user cannot access the forum page
    Given I am an unauthenticated user
    When I navigate to the forum page
    Then I should be redirected to the login page