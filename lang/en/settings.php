<?php

return [
    // General settings
    'title' => 'Settings',
    'description' => 'Manage your settings',
    
    // Profile
    'profile' => [
        'title' => 'Profile settings',
        'breadcrumb' => 'Profile',
        'heading' => 'Profile information',
        'description' => 'Update your name and email address',
        'name' => 'Name',
        'name_placeholder' => 'Full name',
        'email' => 'Email address',
        'email_placeholder' => 'Email address',
        'email_unverified' => 'Your email address is unverified.',
        'email_verified' => 'Email verified',
        'verified_at' => 'Verified on:',
        'resend_verification' => 'Resend verification email',
        'verification_sent' => 'A new verification link has been sent to your email address.',
        'account_info' => 'Account information',
        'account_details' => 'Your account details and dates',
        'account_created' => 'Account created',
        'last_updated' => 'Last updated',
    ],
    
    // Password
    'password' => [
        'title' => 'Password settings',
        'breadcrumb' => 'Password',
        'heading' => 'Update password',
        'description' => 'Ensure your account is using a long, random password to stay secure',
        'current_password' => 'Current password',
        'current_password_placeholder' => 'Current password',
        'new_password' => 'New password',
        'new_password_placeholder' => 'New password',
        'confirm_password' => 'Confirm password',
        'confirm_password_placeholder' => 'Confirm password',
        'save_button' => 'Save password',
    ],
    
    // Appearance
    'appearance' => [
        'title' => 'Appearance settings',
        'heading' => 'Appearance settings',
        'description' => 'Update your account\'s appearance settings',
        'theme' => 'Theme',
        'theme_light' => 'Light',
        'theme_dark' => 'Dark',
        'theme_system' => 'System',
    ],
    
    // Language
    'locale' => [
        'title' => 'Language settings',
        'heading' => 'Language settings',
        'description' => 'Update your account\'s language preferences',
        'language' => 'Language',
    ],
    
    // Delete account
    'delete_account' => [
        'title' => 'Delete account',
        'heading' => 'Delete account',
        'description' => 'Permanently delete your account',
        'confirm_message' => 'Please enter your password to confirm you would like to permanently delete your account.',
        'password_placeholder' => 'Password',
        'button' => 'Delete account',
    ],
    
    // Messages
    'messages' => [
        'profile_updated' => 'Profile updated successfully.',
        'password_updated' => 'Password updated successfully.',
        'appearance_updated' => 'Appearance settings updated successfully.',
        'locale_updated' => 'Language settings updated successfully.',
    ],
]; 