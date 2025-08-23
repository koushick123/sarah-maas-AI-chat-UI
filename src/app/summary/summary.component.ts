import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG modules (add more as needed)
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-summary',
  standalone: true,
  providers: [MessageService],
  imports: [
    FormsModule,
    HttpClientModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    // CardModule,
    TextareaModule,
    RadioButtonModule,
    Dialog,
    ProgressSpinnerModule,
    MessageModule,
    ScrollTopModule,
    ToastModule
],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent {
  books = [
    { label: 'Select a Book', value: null },
    { label: 'Crescent City - House of Earth and Blood', value: 'Crescent-City-Book-1' },
    { label: 'Crescent City - House of Sky and Breath', value: 'Crescent-City-Book-2' },
    { label: 'Crescent City - House of Flame and Shadow', value: 'Crescent-City-Book-3' }
  ];

  chapters: any[] = [];
  parts: any[] = [];
  selectedBook: string | null = null;
  selectedChapter: string | null = null;
  summaryoption: string = '';    
  chapterContent: string = '';
  displayDialog: boolean = false;
  selectedSummary: string | null = null;
  part_chapter_map: Map<string, string[]> = new Map();
  selectedPart: string = '';
  summaryvalue: string = '';
  fetchedsummary: boolean = false;
  BASE_URL: string = 'http://localhost:8000';
  generatesummary: boolean = false;
  doc_id: number = -1;
  dataFetch: boolean = false;
  url: string = '';
  summarysave: boolean = false;

  constructor(private http: HttpClient, private messageService: MessageService) {}

  onBookChange() {
    if (this.selectedBook !== null) {
      this.selectedChapter = null;
      this.selectedPart = '';
      this.selectedSummary = null;
      this.summaryoption = '';
      this.generatesummary = false;
      this.fetchChapterNames();
    } else {
      this.chapters = [];
    }
  }

  selectSummaryOption(selectedSummaryOption: string) {
    this.selectedSummary = selectedSummaryOption;
    this.summaryoption = this.selectedSummary;
    this.generatesummary = true;
    const summary_request_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_summary": '',
      "summary_option": this.selectedSummary,
      "doc_id": this.doc_id
    };
    this.summaryvalue='';
    this.fetchSavedSummary(summary_request_payload);
  }

  fetchSavedSummary(summary_request_payload: any){
    this.http.post<any>(this.BASE_URL+'/chapter/summaries', summary_request_payload)
      .subscribe({
        next: (summary) => {
          this.summaryvalue = summary['summary'];
          this.doc_id = summary['doc_id'];
          console.log('Summary:', summary);

        },
        error: (err) => {
          console.error('Error:', err)
          this.summaryvalue = err;
        }
      });
  }

  fetchChapterContent(selChapter: string) {
    this.selectedChapter = selChapter.replace(" ","-");
    this.dataFetch = false;   
    this.displayDialog = true;
    this.chapterContent = '';
    this.showChapterContent();
  }

  showChapterContent(){
    this.url = this.BASE_URL+'/book/'+this.selectedBook+'/chapter/'+this.selectedChapter+'/contents';
    console.log(this.url);
    this.http.get<string>(this.url)
      .subscribe({
        next :(data) => {
          this.dataFetch = true;
          this.chapterContent = data;
        },
        error: (err) => {
          this.dataFetch = true;
          this.chapterContent = '';
        }
      });
  }

  onHideDialog(){
    this.displayDialog = false;
  }
  
  fetchChapterNames() {
    this.http.get<Map<string, string[]>>(this.BASE_URL+'/book/'+this.selectedBook+'/chapters')
      .subscribe({
        next: (data) => {
          const sortedEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
          this.part_chapter_map = new Map<string, string[]>(sortedEntries);
          
          // Parts list
          this.parts = Array.from(this.part_chapter_map.keys());
        },
        error: (err) => console.error('Error fetching chapters:', err)
      });
  }

  fetchChapterFromPart(){
    this.selectedChapter = null;
      this.selectedSummary = null;
      this.summaryoption = '';
      this.generatesummary = false;
    if (typeof (this.part_chapter_map.get(this.selectedPart)) != 'undefined'){
      const chaptersList = this.part_chapter_map.get(this.selectedPart);
      if (chaptersList) {
        this.chapters = chaptersList.map(chapter => ({
          label: chapter,
          value: chapter
        }));
      }
    }
  }

  updateSummary(){
    if(this.summaryoption != ''){
      // Update the summary for chapter change
      const summary_request_payload = {
        "book_name": this.selectedBook,
        "part": this.selectedPart,
        "chapter_name": this.selectedChapter,
        "chapter_summary": '',
        "summary_option": this.selectedSummary,
        "doc_id": this.doc_id
      };
      this.fetchSavedSummary(summary_request_payload);
    }
  }

  generateSummary() {
    if(this.selectedChapter){
      this.selectedChapter = this.selectedChapter.replace(" ","-");
    }

    if(this.chapterContent == '') {
     this.showChapterContent(); 
    }

    const summary_request_payload = {
        "book_name": this.selectedBook,
        "part": this.selectedPart,
        "chapter_name": this.selectedChapter,
        "chapter_content": this.chapterContent,
        "summary_option": this.selectedSummary
      };
    this.generatesummary = true;
    this.summaryvalue='';
    this.http.post<string>(this.BASE_URL+'/chapter/summary', summary_request_payload)
      .subscribe({
        next: (summary) => {
          this.summaryvalue = summary;
          if(this.selectedChapter){
            this.selectedChapter = this.selectedChapter.replace("-"," ");
          }
        },
        error: (err) => {
          console.error('Error:', err)
          this.summaryvalue = err;
        }
      });
  }

  summarysaveerror = false;
  savedsummary = true;

  saveSummary(){
    const save_summary_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_summary": this.summaryvalue,
      "summary_option": this.selectedSummary,
      "doc_id": this.doc_id
    };
    this.savedsummary = false;
    this.http.post<any>(this.BASE_URL+'/chapter/save', save_summary_payload)
      .subscribe({
        next: (message) => {
          console.log(message['message']);
          this.summarysave = true;
          this.savedsummary = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Chapter Saved Successfully!'
          });
        },
        error: (err) => {
          this.summarysave = true;
          this.savedsummary = true;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Chapter Save Error!'
          });
        }
      });    
  }

//   simulateDelay() {
//   console.log("⏳ Waiting 2 seconds...");
//   setTimeout(() => {
//     console.log("✅ Delay complete!");
//     const save_summary_payload = {
//       "book_name": this.selectedBook,
//       "part": this.selectedPart,
//       "chapter_name": this.selectedChapter,
//       "chapter_summary": this.summaryvalue,
//       "summary_option": this.selectedSummary,
//       "doc_id": this.doc_id
//     };
    
//     // Do something here (e.g., fetch data, update UI)
//   }, 2000); // 2000 ms = 2 seconds
// }
}
