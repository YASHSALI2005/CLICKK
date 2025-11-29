import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class LogCalculator extends JFrame implements ActionListener {

    private JTextField numberField;
    private JLabel resultLabel;

    public LogCalculator() {
        setTitle("Log Calculator");
        setSize(300, 150);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new GridLayout(4, 2));

        // Create components
        JLabel promptLabel = new JLabel("Enter a number:");
        numberField = new JTextField();
        JButton calculateButton = new JButton("Calculate Log");
        resultLabel = new JLabel();

        // Add components to the frame
        add(promptLabel);
        add(numberField);
        add(calculateButton);
        add(resultLabel);

        // Add action listener to the button
        calculateButton.addActionListener(this);
1: powershell
×
Output$0

        // Center the window on the screen
        setLocationRelativeTo(null);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            // Get user input as a double
            double number = Double.parseDouble(numberField.getText());

            if (number <= 0) {
                resultLabel.setText("Please enter a positive number.");
            } else {
                // Calculate the natural logarithm of the number
                double logValue = Math.log(number);

                // Display the result
                resultLabel.setText("The natural logarithm of " + number + " is: " + logValue);
            }
        } catch (NumberFormatException ex) {
            resultLabel.setText("Invalid input. Please enter a valid number.");
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new LogCalculator().setVisible(true);
        });
    }
}