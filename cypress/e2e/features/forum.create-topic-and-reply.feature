Feature: Create forum posts and comments

  Scenario: Authenticated user creates a new forum post
    Given I am logged in as "johanp" with password "johanp"
    And I am on the forum page
    When I create a forum post with title "Cypress forum test post"
    Then I should see the forum post "Cypress forum test post"

  Scenario: Unauthenticated user cannot create a forum post
    Given I am an unauthenticated user
    When I navigate to the forum page
    Then I should be redirected to the login page

  Scenario: Authenticated user posts a comment on an existing post
    Given I am logged in as "peterp" with password "peterp123"
    And I am viewing the forum post "Test Post on Software Engineering"
    When I post a comment "This is a Cypress test comment"
    Then I should see the comment "This is a Cypress test comment"

  Scenario: Authenticated user cannot post an empty comment
    Given I am logged in as "peterp" with password "peterp123"
    And I am viewing the forum post "Test Post on Software Engineering"
    Then the comment post button should be disabled