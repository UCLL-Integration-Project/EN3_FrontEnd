Feature: Enroll students in a schedule

  Scenario: Admin enrolls a student in a schedule
    Given I am logged in as "admin" with password "admin"
    And I selected the schedule for "Full-stack development"
    And the selected schedule has 0 enrolled student
    When I enroll student "Bruce Banner"
    Then the selected schedule should have 1 enrolled students
    And student "Bruce Banner" should no longer be available for enrollment
