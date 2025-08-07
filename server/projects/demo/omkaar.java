// FileName: LoginUIDemo.java
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

class LoginUI extends JFrame implements ActionListener {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JLabel statusLabel;

    public LoginUI() {
        setTitle("Login UI Example");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(350, 200);
        setLocationRelativeTo(null);
        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        // Username Label and Field
        gbc.gridx = 0;
        gbc.gridy = 0;
        add(new JLabel("Username:"), gbc);
        gbc.gridx = 1;
        usernameField = new JTextField(15);
        add(usernameField, gbc);

        // Password Label and Field
        gbc.gridx = 0;
        gbc.gridy = 1;
        add(new JLabel("Password:"), gbc);
        gbc.gridx = 1;
        passwordField = new JPasswordField(15);
        add(passwordField, gbc);

        // Login Button
        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        loginButton = new JButton("Login");
        loginButton.addActionListener(this);
        add(loginButton, gbc);

        // Status Label
        gbc.gridy = 3;
        statusLabel = new JLabel("");
        statusLabel.setHorizontalAlignment(JLabel.CENTER);
        add(statusLabel, gbc);

        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        String username = usernameField.getText();
        String password = new String(passwordField.getPassword());
        // Simple hardcoded check for demonstration
        if (username.equals("Omkaar") && password.equals("1234")) {
            statusLabel.setText("Login successful!");
        } else {
            statusLabel.setText("Invalid credentials");
        }
    }
}

public class LoginUIDemo {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(LoginUI::new);
    }
}
