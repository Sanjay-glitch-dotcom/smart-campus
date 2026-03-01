package com.example.smart_campus.service;

import com.example.smart_campus.model.Issue;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendIssueConfirmation(String toEmail, Issue issue) {
        String subject = "Issue Submitted Successfully — #" + issue.getId();
        String body = """
            <h3>Hello,</h3>
            <p>Your issue has been submitted successfully.</p>
            <ul>
                <li><b>Issue ID:</b> #%d</li>
                <li><b>Title:</b> %s</li>
                <li><b>Priority:</b> %s</li>
                <li><b>Status:</b> %s</li>
            </ul>
            <p>We will notify you once it is assigned or resolved.</p>
            """.formatted(
                issue.getId(),
                issue.getTitle(),
                issue.getPriority().name(),
                issue.getStatus().name()
            );
        sendEmail(toEmail, subject, body);
    }

    public void sendStatusUpdate(String toEmail, Issue issue) {
        String subject = "Issue Status Updated — #" + issue.getId();
        String body = """
            <h3>Hello,</h3>
            <p>Your issue status has been updated.</p>
            <ul>
                <li><b>Issue ID:</b> #%d</li>
                <li><b>Title:</b> %s</li>
                <li><b>New Status:</b> %s</li>
            </ul>
            """.formatted(
                issue.getId(),
                issue.getTitle(),
                issue.getStatus().name()
            );
        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to: " + to, e);
        }
    }
}