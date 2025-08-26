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
  part_chapter_map: Map<string, string[]> = new Map();
  selectedPart: string = '';
  summary1value: string = '';
  summary2value: string = '';
  summary3value: string = '';
  fetchedsummary: boolean = false;
  BASE_URL: string = 'http://localhost:8000';
  generatesummary: boolean = false;
  doc_id: number = -1;
  dataFetch: boolean = false;
  url: string = '';
  summary_request_payload: any = '';
    
  constructor(private http: HttpClient, private messageService: MessageService) {}

  onBookChange() {
    if (this.selectedBook !== null) {
      this.selectedChapter = null;
      this.selectedPart = '';
      this.summaryoption = '';
      this.generatesummary = false;
      this.fetchChapterNames();
    } else {
      this.chapters = [];
    }
  }

  summary1empty: boolean = true;
  summary2empty: boolean = true;

  selectSummaryOption(selectedSummaryOption: string) {
    this.summaryoption = selectedSummaryOption;
    this.generatesummary = true;
    this.summary_request_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_summary": '',
      "summary_option": this.summaryoption,
      "doc_id": this.doc_id
    };
    
    if(this.summaryoption == 'summary1'){
      const summaryNotFound: string = 'No chapter summaries found.';
      if(this.summary1value == '' || this.summary1value == summaryNotFound){
        //To enable spinner to be shown
        this.summary1value = '';
        this.fetchSavedSummary(this.summary_request_payload);
      }
    }
    else if(this.summaryoption == 'summary2'){
      const summaryNotFound: string = 'No chapter summaries found.';
      if(this.summary2value == '' || this.summary2value == summaryNotFound){
        //To enable spinner to be shown
        this.summary2value = '';
        this.fetchSavedSummary(this.summary_request_payload);
      }
    }
    else{
      if(this.summary1empty || this.summary2empty){
        this.fetchAllSummaries(this.summary_request_payload);
      }
    }
  }

  originaloption: string = '';

  fetchAllSummaries(summary_request_payload: any){
    this.originaloption = this.summaryoption;  
    
    //Fetch summary 1    
    summary_request_payload['summary_option']='summary1';
    this.summaryoption = 'summary1';

    this.http.post<any>(this.BASE_URL+'/chapter/summaries', summary_request_payload)
      .subscribe({
        next: (summary) => {
          this.summary1value = summary['summary'];
          this.summary1empty = false;        
          console.log('Summary 1 :', summary);
          
          //Fetch summary 2 
          summary_request_payload['summary_option']='summary2';
          this.summaryoption = 'summary2';

          this.http.post<any>(this.BASE_URL+'/chapter/summaries', summary_request_payload)
          .subscribe({
            next: (summary) => {
                this.summary2value = summary['summary'];
                this.summary2empty = false;
                console.log('Summary 2 :', summary);
                
                //Fetch summary 3
                summary_request_payload['summary_option']='summary3';
                this.summaryoption = 'summary3';

                this.http.post<any>(this.BASE_URL+'/chapter/summaries', summary_request_payload)
                .subscribe({
                  next: (summary) => {
                    this.summary3value = summary['summary'];
                    console.log('Summary 3 :', summary);
                  },
                    error: (err) => {
                    console.error('Error summary 3 :', err)
                    this.summary3value = err;
                  }
                });
              },
              error: (err) => {
                console.error('Error summary 2 :', err)
                this.summary2value=err;
              }
          });
          this.summaryoption = this.originaloption;
          console.log('Restore original option = '+this.originaloption);
        },
        error: (err) => {
          console.error('Error:', err)
          if(this.summaryoption == 'summary1'){
            this.summary1value=err;
          }
          else if(this.summaryoption == 'summary2'){
            this.summary2value=err;
          }
          else{
            this.summary3value=err;
          }
          this.summaryoption = this.originaloption;
        }
      });
  }

  fetchSavedSummary(summary_request_payload: any){
    this.http.post<any>(this.BASE_URL+'/chapter/summaries', summary_request_payload)
      .subscribe({
        next: (summary) => {
          if(this.summaryoption == 'summary1'){
            this.summary1value = summary['summary'];
            this.summary1empty = false;
          }
          else if(this.summaryoption == 'summary2'){
            this.summary2value = summary['summary'];
            this.summary2empty = false;
          }
          else{
            this.summary3value = summary['summary'];
          }

          this.doc_id = summary['doc_id'];
          console.log('Summary:', summary);

        },
        error: (err) => {
          console.error('Error:', err)
          if(this.summaryoption == 'summary1'){
            this.summary1value=err;
          }
          else if(this.summaryoption == 'summary2'){
            this.summary2value=err;
          }
          else{
            this.summary3value=err;
          }
        }
      });
  }

  fetchChapterContent(selChapter: string) {
    this.dataFetch = false;   
    this.displayDialog = true;
    this.chapterContent = '';      
    this.showChapterContent();
  }

  selChapterWithHyphen: string|null = ''

  showChapterContent(){
    if(this.selectedChapter){
      this.selChapterWithHyphen = this.selectedChapter;
      this.url = this.BASE_URL+'/book/'+this.selectedBook+'/chapter/'+this.selChapterWithHyphen.replace(" ","-")+'/contents';
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
  }

  onHideDialog(){
    this.displayDialog = false;
    console.log(this.selectedChapter);
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
        "summary_option": this.summaryoption,
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
        "summary_option": this.summaryoption
      };
    this.generatesummary = true;
    if(this.summaryoption == 'summary1'){
      this.summary1value='';
    }
    else if(this.summaryoption == 'summary2'){
      this.summary2value='';
    }
    else{
      this.summary3value='';
    }
    this.http.post<string>(this.BASE_URL+'/chapter/summary', summary_request_payload)
      .subscribe({
        next: (summary) => {
          if(this.summaryoption == 'summary1'){
            this.summary1value=summary;
          }
          else if(this.summaryoption == 'summary2'){
            this.summary2value=summary;
          }
          else{
            this.summary3value=summary;
          }
          if(this.selectedChapter){
            this.selectedChapter = this.selectedChapter.replace("-"," ");
          }
        },
        error: (err) => {
          console.error('Error:', err)
          if(this.summaryoption == 'summary1'){
            this.summary1value=err;
          }
          else if(this.summaryoption == 'summary2'){
            this.summary2value=err;
          }
          else{
            this.summary3value=err;
          }
        }
      });
  }

  savedsummary = true;
  chapter_summary = '';
  saveSummary(){
    this.chapter_summary = (this.summaryoption == 'summary1' ? this.summary1value : (this.summaryoption == 'summary2' ? this.summary2value : 
        this.summary3value));
    const save_summary_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_summary": this.chapter_summary,
      "summary_option": this.summaryoption,
      "doc_id": this.doc_id
    };
    console.log("Payload = "+JSON.stringify(save_summary_payload));
    this.savedsummary = false;
    this.http.post<any>(this.BASE_URL+'/chapter/save', save_summary_payload)
      .subscribe({
        next: (message) => {
          console.log(message['message']);
          this.savedsummary = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Chapter Saved Successfully!'
          });
        },
        error: (err) => {
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
//       "summary_option": this.summaryoption,
//       "doc_id": this.doc_id
//     };
    
//     // Do something here (e.g., fetch data, update UI)
//   }, 2000); // 2000 ms = 2 seconds
// }
}
