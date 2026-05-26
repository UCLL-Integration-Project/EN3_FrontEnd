Feature: Device page access and guards

  Scenario: Guest is redirected from device page to login
    Given I am a guest visiting the device page
    Then I should be redirected to the login page

  Scenario: Guest is redirected from device setup to login
    Given I am a guest visiting the device setup page
    Then I should be redirected to the login page

  Scenario: Logged-in user without a device sees the setup intro
    Given I am a logged-in user visiting device setup without a linked device
    Then I should see the device setup intro title

  Scenario: Logged-in user without a device is redirected from device to setup
    Given I am a logged-in user visiting device page without a linked device
    Then I should be redirected to the device setup page

  Scenario: Logged-in user with a linked device is redirected from setup to device
    Given I am a logged-in user visiting device setup with a linked device
    Then I should be redirected to the device management page
