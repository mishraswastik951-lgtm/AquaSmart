import zipfile
import xml.etree.ElementTree as ET

def read_docx(file_path):
    try:
        with zipfile.ZipFile(file_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            text_runs = []
            for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                para_text = []
                for run in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                    if run.text:
                        para_text.append(run.text)
                if para_text:
                    text_runs.append("".join(para_text))
            
            return "\n".join(text_runs)
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    path = r"c:\Users\mishr\Downloads\smart_irrigation_project_brief.docx"
    content = read_docx(path)
    with open("project_brief.txt", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success: Written to project_brief.txt")
