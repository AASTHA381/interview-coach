import AppKit
import Foundation
import PDFKit
import Vision

// Usage: ic-ocr <file.pdf|image>   Prints recognized text to stdout. Exit code 2 on failure.
let maxPages = 10
let targetLongSide: CGFloat = 2600

func fail(_ message: String) -> Never {
    FileHandle.standardError.write((message + "\n").data(using: .utf8)!)
    exit(2)
}

func recognize(_ image: CGImage) -> String {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    if #available(macOS 13.0, *) { request.automaticallyDetectsLanguage = true }
    let handler = VNImageRequestHandler(cgImage: image, options: [:])
    do { try handler.perform([request]) } catch { return "" }
    let observations = (request.results ?? []).sorted { a, b in
        let ay = a.boundingBox.midY, by = b.boundingBox.midY
        if abs(ay - by) > 0.008 { return ay > by }
        return a.boundingBox.minX < b.boundingBox.minX
    }
    return observations.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
}

func cgImage(from image: NSImage) -> CGImage? {
    var rect = CGRect(origin: .zero, size: image.size)
    return image.cgImage(forProposedRect: &rect, context: nil, hints: nil)
}

guard CommandLine.arguments.count == 2 else { fail("usage: ic-ocr <file>") }
let url = URL(fileURLWithPath: CommandLine.arguments[1])

if url.pathExtension.lowercased() == "pdf" {
    guard let doc = PDFDocument(url: url) else { fail("cannot open PDF") }
    var pages: [String] = []
    for index in 0..<min(doc.pageCount, maxPages) {
        guard let page = doc.page(at: index) else { continue }
        let bounds = page.bounds(for: .mediaBox)
        let scale = targetLongSide / max(bounds.width, bounds.height)
        let size = NSSize(width: bounds.width * scale, height: bounds.height * scale)
        let thumb = page.thumbnail(of: size, for: .mediaBox)
        if let cg = cgImage(from: thumb) { pages.append(recognize(cg)) }
    }
    print(pages.joined(separator: "\n\n"))
} else {
    guard let image = NSImage(contentsOf: url), let cg = cgImage(from: image) else { fail("cannot open image") }
    print(recognize(cg))
}
