import JSZip from 'jszip';

interface JavaFXFile {
  name: string;
  code: string;
}

export async function downloadJavaFXProjectZip(
  files: JavaFXFile[],
  projectName: string = 'JavaFX_Matrix_Project'
) {
  const zip = new JSZip();

  // 1. Add pom.xml for Maven & IntelliJ IDEA / Eclipse
  const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.autota</groupId>
    <artifactId>javafx-matrix-assignment</artifactId>
    <version>1.0-SNAPSHOT</version>
    <name>AutoTA JavaFX Assignment</name>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <javafx.version>21.0.2</javafx.version>
    </properties>

    <dependencies>
        <!-- JavaFX Controls and Graphics -->
        <dependency>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-controls</artifactId>
            <version>\${javafx.version}</version>
        </dependency>
        <dependency>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-graphics</artifactId>
            <version>\${javafx.version}</version>
        </dependency>

        <!-- JUnit 5 Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.openjfx</groupId>
                <artifactId>javafx-maven-plugin</artifactId>
                <version>0.0.8</version>
                <configuration>
                    <mainClass>com.autota.javafx.MainApplication</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`;
  zip.file('pom.xml', pomXml);

  // 2. Add README.md
  const readmeContent = `# 🚀 JavaFX Question 2 Matrix Project
Exported from AutoTA AI Pedagogical Platform.

## 💻 How to run in IntelliJ IDEA:
1. Open IntelliJ IDEA -> **File -> Open...**
2. Select this project folder (containing \`pom.xml\`).
3. IntelliJ will automatically resolve Maven dependencies.
4. Run \`MainApplication.java\` or run the Maven goal: \`javafx:run\`.

## ☕ Structure:
- \`src/main/java/com/autota/javafx/MainApplication.java\`
- \`src/main/java/com/autota/javafx/MatrixController.java\`
- \`src/main/java/com/autota/javafx/MatrixModel.java\`
`;
  zip.file('README.md', readmeContent);

  // 3. Add source files into src/main/java/com/autota/javafx/
  const srcFolder = zip.folder('src/main/java/com/autota/javafx');
  if (srcFolder) {
    files.forEach((f) => {
      srcFolder.file(f.name, f.code);
    });
  }

  // 4. Generate zip blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
