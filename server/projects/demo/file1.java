// Define a class named Person
public class Person {
    // Private attributes (data)
    private String name;
    private int age;

    // Constructor to initialize the attributes
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Getter for the name attribute
    public String getName() {
        return name;
    }

    // Setter for the name attribute
    public void setName(String name) {
        if (name != null && !name.isEmpty()) {
            this.name = name;
        } else {
            System.out.println("Name cannot be null or empty.");
        }
    }

    // Getter for the age attribute
    public int getAge() {
        return age;
    }

    // Setter for the age attribute
    public void setAge(int age) {
        if (age >= 0) {
            this.age = age;
        } else {
            System.out.println("Age cannot be negative.");
        }
    }

    // Method to display person details
    public void displayDetails() {
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
    }
}

// Main class to demonstrate encapsulation
public class EncapsulationExample {
    public static void main(String[] args) {
        // Create an instance of Person
        Person person = new Person("John Doe", 30);

        // Access and modify attributes using getters and setters
        System.out.println("Initial Details:");
        person.displayDetails();

        person.setName("Jane Smith");
        person.setAge(25);

        System.out.println("\nUpdated Details:");
        person.displayDetails();
    }
}