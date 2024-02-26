''' Signals: user events. '''
from django.core.mail import send_mail
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from django_rest_passwordreset.signals import reset_password_token_created # type: ignore


_EMAIL_NOREPLY = 'noreply.portal@yandex.ru'
_EMAIL_SUBJECT = 'Восстановление пароля КонцептПортал'
_EMAIL_TEMPLATE = 'password_reset_email.html'
_RECOVERY_URL = 'https://portal.acconcept.ru/password-change'


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    '''
    Handles password reset tokens
    When a token is created, an e-mail needs to be sent to the user
    '''
    context = {
        'current_user': reset_password_token.user,
        'username': reset_password_token.user.username,
        'first_name': reset_password_token.user.first_name,
        'email': reset_password_token.user.email,
        'reset_password_url': f'{_RECOVERY_URL}?token={reset_password_token.key}'
    }
    email_html_message = render_to_string(_EMAIL_TEMPLATE, context)
    email_plaintext_message = strip_tags(email_html_message)
    send_mail(
        subject=_EMAIL_SUBJECT,
        message=email_plaintext_message,
        from_email=_EMAIL_NOREPLY,
        recipient_list=[context['email']],
        html_message=email_html_message,
        fail_silently=False
    )
