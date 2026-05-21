Feature: Admin route guard
  The proxy middleware bounces non-admins off /[locale]/admin/* before the
  page renders. The cw_session and cw_admin hint cookies decide what happens;
  the backend's RBAC remains the real enforcement.

  Scenario: Anonymous visitor is redirected from admin to login
    Given I have no auth cookies
    When I navigate to the admin path "/en/admin/members"
    Then I should land on the login page

  Scenario: Signed-in non-admin is redirected from admin to 403
    Given I have only the cw_session cookie
    When I navigate to the admin path "/en/admin/members"
    Then I should land on the forbidden page
    And I should see the forbidden eyebrow

  Scenario: Signed-in admin reaches the admin route
    Given I have the cw_session and cw_admin cookies
    When I navigate to the admin path "/en/admin/members"
    Then I should not land on the forbidden page
