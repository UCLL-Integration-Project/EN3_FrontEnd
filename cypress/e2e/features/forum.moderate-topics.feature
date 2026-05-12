Feature: Moderate discussion posts

  Scenario: Lecturer can access the forum posts overview
    Given I am logged in as "johanp" with password "johanp"
    When I navigate to the forum page
    Then I should see a list of forum posts
    And I should see the forum post "Test Post on Software Engineering"

  Scenario: Student cannot see moderation actions
    Given I am logged in as "peterp" with password "peterp123"
    When I navigate to the forum page
    Then I should not see moderation actions for forum posts