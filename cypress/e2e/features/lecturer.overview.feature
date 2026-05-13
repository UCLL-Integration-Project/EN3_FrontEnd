Feature: Lecturers Overview

Background:
    Given I am logged in as "johanp" with password "johanp"
    When I navigate to the lecturers page

Scenario: Unauthenticated user attempts to access the lecturers overview page
    Given I am an unauthenticated user
    When I navigate to the lecturers page
    Then I should see an unauthorized error message

Scenario: Authenticated user attempts to access the lecturers overview page
    Then I should see a table with all lecturers

Scenario: Authenticated user sees correct lecturers table data
    Then I should see the correct lecturers table data:
        | firstname | lastname | email                     | expertise                                      |
        | Johan     | Pieck    | johan.pieck@ucll.be       | Full-stack development, Front-end development |
        | Jeroen    | Rombouts | jeroen.rombouts@ucll.be   | Software Engineering, Back-End Development     |
        | Bram      | Van Impe | bram.vanimpe@ucll.be      | Full-Stack development, Back-end Development   |
        | Ruben     | Naudts   | ruben.naudts@ucll.be      | Full-Stack development, Front-end Development  |